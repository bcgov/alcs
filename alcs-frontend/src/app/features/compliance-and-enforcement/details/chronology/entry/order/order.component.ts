import { Component, computed, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment, { Moment } from 'moment';
import { catchError, debounceTime, EMPTY, firstValueFrom, Subject, switchMap, takeUntil } from 'rxjs';
import { ComplianceAndEnforcementChronologyService } from '../../../../../../services/compliance-and-enforcement/chronology/chronology.service';
import {
  NotificationMethods,
  OrderDto,
  OrderNotification,
  OrderType,
  UpdateOrderDto,
} from '../../../../../../services/compliance-and-enforcement/chronology/order/order.dto';
import { ComplianceAndEnforcementOrderService } from '../../../../../../services/compliance-and-enforcement/chronology/order/order.service';
import { AllegedActivity } from '../../../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementDocumentDto } from '../../../../../../services/compliance-and-enforcement/documents/document.dto';
import {
  ComplianceAndEnforcementDocumentService,
  Section,
} from '../../../../../../services/compliance-and-enforcement/documents/document.service';
import { FOIPPACategory } from '../../../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.dto';
import { ResponsiblePartiesService } from '../../../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DocumentUploadDialogComponent } from '../../../../../../shared/document-upload-dialog/document-upload-dialog.component';
import { DocumentDto } from '../../../../../../shared/document-upload-dialog/document-upload-dialog.dto';
import {
  DocumentUploadDialogData,
  DocumentUploadDialogOptions,
} from '../../../../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../../../../shared/document/document.dto';
import { findFileNumberInRouteTree } from '../../../../../../shared/utils/routing';
import {
  DecisionConditionDateDialogComponent,
  DueDate,
} from '../../../../../application/decision/decision-v2/decision-input/decision-conditions/decision-condition/decision-condition-date-dialog/decision-condition-date-dialog.component';
import { C_E_AUTOSAVE_DEBOUNCE_MS } from '../../../../constants';

type NotificationMethodForm = FormGroup<{
  wasNotified: FormControl<boolean>;
  on: FormControl<string | null>;
}>;

interface NotificationMethodFormData {
  wasNotified: boolean;
  on: string | null;
}

enum IssueeType {
  INDIVIDUAL_RESPONSIBLE_PARTY = 'Individual Responsible Party',
  DIRECTOR = 'Director',
}

interface Issuee {
  uuid: string;
  type: IssueeType;
  name: string;
  organization: string | null;
}

const notificationValidator = (group: AbstractControl): ValidationErrors | null => {
  if (!(group instanceof FormGroup)) {
    return null;
  }

  const selectedMethodsData = Object.entries<NotificationMethodFormData>(group.value).filter(
    ([_, data]) => data.wasNotified,
  );

  const errors = {
    noNotificationType: selectedMethodsData.length < 1,
    missingNotificationDate: !selectedMethodsData.every(([methodName, _]) => {
      const selectedMethodForm = group.controls[methodName];

      return selectedMethodForm instanceof FormGroup && !!selectedMethodForm.value.on;
    }),
  };

  return Object.values<boolean>(errors).some((hasError) => hasError) ? errors : null;
};

@Component({
  selector: 'app-compliance-and-enforcement-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  standalone: false,
})
export class ComplianceAndEnforcementOrderComponent implements OnInit, OnDestroy {
  documentOptions: DocumentUploadDialogOptions = {
    allowedVisibilityFlags: [],
    allowsFileEdit: true,
    defaultDocumentType: DOCUMENT_TYPE.C_AND_E_ORDER,
    defaultDocumentSource: DOCUMENT_SOURCE.ALC,
    typeDisabled: true,
    sourceDisabled: true,
  };

  section = Section.CHRONOLOGY_ENTRY;

  OrderType = OrderType;
  orderTypes = Object.values(OrderType);
  notificationMethods = Object.values(NotificationMethods);
  allegedActivities = Object.values(AllegedActivity);
  IssueeType = IssueeType;

  fileNumber?: string;
  entryUuid?: string;
  entry = computed(() => {
    if (!this.entryUuid) {
      return;
    }

    return this.chronologyService.entriesByUuid().get(this.entryUuid);
  });
  uuid?: string;
  order = computed(() => {
    if (!this.uuid) {
      return;
    }

    return this.service.ordersByUuid().get(this.uuid);
  });

  issuees = signal<Issuee[] | null>(null);

  formIsSubscribed = false;

  form = new FormGroup({
    date: new FormControl<Moment | null>(null, [Validators.required]),
    type: new FormControl<OrderType | null>(null, [Validators.required]),
    allegedActivity: new FormControl<AllegedActivity[]>([], [Validators.required]),
    amount: new FormControl<string | null>(null),
    issuedToUuid: new FormControl<string | null>(null, [Validators.required]),
    notifiedBy: new FormGroup(
      Object.values(NotificationMethods).reduce(
        (controls, method) => {
          controls[method as NotificationMethods] = new FormGroup({
            wasNotified: new FormControl(false, { nonNullable: true }),
            on: new FormControl<string | null>(null),
          });

          return controls;
        },
        {} as Record<NotificationMethods, NotificationMethodForm>,
      ),
      [notificationValidator],
    ),
  });

  showErrors = false;

  dueDates = computed(() => (this.uuid ? this.service.ordersByUuid().get(this.uuid)?.dueDates : undefined) ?? []);

  $destroy = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly service: ComplianceAndEnforcementOrderService,
    private readonly chronologyService: ComplianceAndEnforcementChronologyService,
    private readonly responsiblePartiesService: ResponsiblePartiesService,
    private readonly toastService: ToastService,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly documentService: ComplianceAndEnforcementDocumentService,
    public dialog: MatDialog,
  ) {
    effect(() => {
      if (!this.uuid) {
        return;
      }

      const order = this.order();

      if (!order) {
        return;
      }

      this.fillForm(order, false);
    });
  }

  ngOnInit(): void {
    this.fileNumber = findFileNumberInRouteTree(this.route);

    this.route.params
      .pipe(
        switchMap(async (params) => {
          // Cast is safe, since uuid required by route
          const { entryUuid, orderUuid }: { entryUuid: string; orderUuid: string } = params as {
            entryUuid: string;
            orderUuid: string;
          };

          // Must come before checking this.entry()
          this.entryUuid = entryUuid;
          if (!this.entry()) {
            this.chronologyService.loadEntries({ filterByUuid: entryUuid }).subscribe();
          }

          // Must come before checking this.order()
          this.uuid = orderUuid;
          if (!this.order()) {
            this.service.loadOrders({ filterByUuid: orderUuid }).subscribe();
          }

          this.subscribeFormChanges(orderUuid);
        }),
        takeUntil(this.$destroy),
      )
      .subscribe();

    this.loadResponsibleParties();
  }

  fillForm(order: OrderDto, emitEvent: boolean = true): void {
    this.form.reset({}, { emitEvent: false });

    this.form.patchValue(
      {
        date: order.date ? moment(order.date) : null,
        type: order.type,
        allegedActivity: order.allegedActivity,
        amount: order.amount,
        issuedToUuid: order.issuedToIndividualResponsiblePartyUuid || order.issuedToDirectorUuid,
        notifiedBy: order.notifications.reduce(
          (notifiedBy, { method, date }) => {
            notifiedBy[method] = {
              wasNotified: true,
              on: date,
            };

            return notifiedBy;
          },
          {} as Record<NotificationMethods, NotificationMethodFormData>,
        ),
      },
      { emitEvent },
    );
  }

  entryDateText() {
    const timestamp = this.entry()?.date;

    return timestamp ? moment(timestamp).format('YYYY-MMM-DD') : 'No Date';
  }

  subscribeFormChanges(uuid: string): void {
    this.form.valueChanges
      .pipe(
        debounceTime(C_E_AUTOSAVE_DEBOUNCE_MS),
        switchMap((formData) => {
          const dto = this.dtoFromForm(formData, true);

          return this.service.update(uuid, dto);
        }),
        catchError((error) => {
          console.error('Error saving order', error);
          this.toastService.showErrorToast('Failed to save order');
          return EMPTY;
        }),
        takeUntil(this.$destroy),
      )
      .subscribe(() => {
        this.toastService.showSuccessToast('Order saved');
      });
  }

  async loadResponsibleParties(): Promise<void> {
    if (!this.fileNumber) {
      this.toastService.showErrorToast('There was a problem loading responsible parties');
      console.error('Failed to load responsible parties. No C&E file number provided.');
      return;
    }

    const responsibleParties = await this.responsiblePartiesService.fetchByFileNumber(this.fileNumber);

    const issuees = responsibleParties.reduce((issuees, party) => {
      if (party.foippaCategory === FOIPPACategory.INDIVIDUAL) {
        const newIssuee = {
          uuid: party.uuid,
          type: IssueeType.INDIVIDUAL_RESPONSIBLE_PARTY,
          name: party.individualName ?? 'No Name',
          organization: null,
        };

        issuees.push(newIssuee);
      } else if (party.foippaCategory === FOIPPACategory.ORGANIZATION) {
        const newIssuees = party.directors?.map((director) => ({
          uuid: director.uuid,
          type: IssueeType.DIRECTOR,
          name: director.directorName ?? 'No Name',
          organization: party.organizationName ?? null,
        }));

        if (newIssuees) {
          issuees?.push(...newIssuees);
        }
      }

      return issuees;
    }, [] as Issuee[]);

    this.issuees.set(issuees);
  }

  async onDeleteButtonClick() {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete the order and associated report?`,
      })
      .subscribe(async (accepted) => {
        if (!accepted) {
          return;
        }

        if (!this.uuid) {
          console.error('No order UUID found');
          this.toastService.showErrorToast('Failed to delete order');
          return;
        }

        this.service
          .delete(this.uuid)
          .pipe(
            catchError((error) => {
              console.error('Error deleting entry:', error);
              this.toastService.showErrorToast('Failed to delete entry.');
              return EMPTY;
            }),
          )
          .subscribe(() => {
            this.toastService.showSuccessToast('Entry deleted successfully.');
            this.router.navigate(['../../../../..'], { relativeTo: this.route });
          });
      });
  }

  async saveAndExit(isDraft: boolean): Promise<void> {
    const dto = this.dtoFromForm(this.form.value, isDraft);

    if (this.uuid) {
      try {
        await firstValueFrom(this.service.update(this.uuid, dto));
        this.toastService.showSuccessToast('Order saved');
      } catch (error) {
        console.error('Error saving order', error);
        this.toastService.showErrorToast('Failed to save order');
        return;
      }
    }

    this.router.navigate(['../../../../..'], { relativeTo: this.route });
  }

  async onFinishButtonClick() {
    if (this.form.invalid || !this.order()?.documents.length) {
      this.form.controls.date.markAsTouched();
      this.form.controls.type.markAsTouched();
      this.form.controls.issuedToUuid.markAsTouched();
      this.form.controls.allegedActivity.markAsTouched();

      this.showErrors = true;
    } else {
      this.showErrors = false;

      await this.saveAndExit(false);
    }
  }

  dtoFromForm(formData: typeof this.form.value, isDraft: boolean): UpdateOrderDto {
    const dto: UpdateOrderDto = { isDraft };

    if (formData.date === null) {
      dto.date = null;
    } else if (formData.date !== undefined) {
      dto.date = formData.date.format('YYYY-MM-DD');
    }

    if (formData.type) {
      dto.type = formData.type;
    }

    if (formData.issuedToUuid) {
      const issuee = this.issuees()?.find((issuee) => issuee.uuid === formData.issuedToUuid);

      if (issuee) {
        dto.issuedToIndividualResponsiblePartyUuid =
          issuee.type === IssueeType.INDIVIDUAL_RESPONSIBLE_PARTY ? issuee.uuid : null;
        dto.issuedToDirectorUuid = issuee.type === IssueeType.DIRECTOR ? issuee.uuid : null;
      }
    }

    if (formData.allegedActivity) {
      dto.allegedActivity = formData.allegedActivity;
    }

    if (formData.amount !== undefined) {
      dto.amount = formData.amount ? formData.amount : null;
    }

    dto.notifications = Object.entries(this.form.controls.notifiedBy.getRawValue()).reduce(
      (methods, [method, { wasNotified, on }]) => {
        if (wasNotified) {
          methods.push({
            method: method as NotificationMethods,
            date: on,
          });
        }

        return methods;
      },
      [] as OrderNotification[],
    );

    return dto;
  }

  openAddDocumentDialog(entryUuid: string | undefined, orderUuid: string | undefined): void {
    this.openDocumentDialog({
      chronologyEntryUuid: entryUuid,
      orderUuid: orderUuid,
    });
  }

  openEditDocumentDialog(
    entryUuid: string | undefined,
    orderUuid: string | undefined,
    document: ComplianceAndEnforcementDocumentDto,
  ) {
    this.openDocumentDialog(
      {
        chronologyEntryUuid: entryUuid,
        orderUuid: orderUuid,
      },
      document,
    );
  }

  openDocumentDialog(optionOverrides?: DocumentUploadDialogOptions, document?: DocumentDto) {
    if (!this.fileNumber) {
      console.error('File number is required to open the upload dialog.');
      return;
    }

    const data: DocumentUploadDialogData = {
      ...this.documentOptions,
      ...{
        documentService: this.documentService,
        fileId: this.fileNumber,
        section: this.section,
        existingDocument: document,
      },
      ...optionOverrides,
    };

    this.dialog
      .open(DocumentUploadDialogComponent, {
        minWidth: '600px',
        maxWidth: '800px',
        width: '70%',
        data,
      })
      .afterClosed()
      .subscribe((saved) => {
        if (!saved) {
          return;
        }

        if (!this.uuid) {
          console.error('Failed to reload order');
          this.toastService.showErrorToast('Filed to reload order');
          return;
        }

        this.service.loadOrders({ filterByUuid: this.uuid }).subscribe();

        const entry = this.entry();

        if (!entry?.uuid) {
          console.error('Failed to reload entry. No UUID available');
          this.toastService.showErrorToast('Failed to reload entry');
          return;
        }

        this.chronologyService.loadEntries({ filterByUuid: entry.uuid }).subscribe();
      });
  }

  confirmDocumentDelete(document: ComplianceAndEnforcementDocumentDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${document.fileName}?`,
      })
      .subscribe(async (accepted) => {
        if (!accepted) {
          return;
        }

        try {
          await this.documentService.delete(document.uuid);
          this.toastService.showSuccessToast('Document deleted');
        } catch (error) {
          console.error('Error deleting document:', error);
          this.toastService.showErrorToast('Failed to delete document.');
        }

        this.service.loadOrders({ filterByUuid: this.uuid }).subscribe();
      });
  }

  notificationMethodChecked(method: string): boolean {
    return this.form.controls.notifiedBy.controls[method as NotificationMethods].controls.wasNotified.getRawValue();
  }

  notificationDateTimestamp(method: string): number | null {
    return moment(this.form.controls.notifiedBy.controls[method as NotificationMethods].controls.on.getRawValue())
      .toDate()
      .getTime();
  }

  onNotificationDateSave(method: string, date: number) {
    this.form.controls.notifiedBy.controls[method as NotificationMethods].controls.on.patchValue(
      date ? moment(date).format('YYYY-MM-DD') : null,
    );
  }

  formattedDate(date: string): string {
    return moment(date).format('YYYY-MMM-DD');
  }

  openDueDateDialog(isAdding: boolean) {
    this.dialog
      .open(DecisionConditionDateDialogComponent, {
        maxHeight: '80vh',
        data: {
          dates: this.dueDates(),
          isAdding,
          isRequired: false,
        },
      })
      .beforeClosed()
      .subscribe(async (dueDates: DueDate[] | null) => {
        if (!dueDates || !this.uuid) {
          return;
        }

        const order = this.dtoFromForm(this.form.value, true);

        order.dueDates = dueDates.map((dueDate) => ({
          uuid: dueDate.uuid,
          orderUuid: this.uuid,
          date: dueDate.date?.format('YYYY-MM-DD'),
        }));

        try {
          await firstValueFrom(this.service.update(this.uuid, order));
          this.toastService.showSuccessToast('Order saved');
          this.service.loadOrders({ filterByUuid: this.uuid }).subscribe();
        } catch (error) {
          console.error('Error saving order', error);
          this.toastService.showErrorToast('Failed to save order');
          return;
        }
      });
  }

  onTypeChange(event: OrderType) {
    if (event === OrderType.PENALTY_ORDER) {
      this.form.controls.amount.setValidators([Validators.required]);
    } else {
      this.form.controls.amount.clearValidators();
      this.form.controls.amount.setValue(null);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}

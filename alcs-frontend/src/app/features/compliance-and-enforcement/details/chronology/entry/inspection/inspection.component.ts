import { Component, computed, effect, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment, { Moment } from 'moment';
import { catchError, debounceTime, EMPTY, firstValueFrom, map, Subject, switchMap, takeUntil } from 'rxjs';
import { ComplianceAndEnforcementChronologyService } from '../../../../../../services/compliance-and-enforcement/chronology/chronology.service';
import {
  AttendeeDto,
  InspectionDto,
  InspectionType,
  UpdateAttendeeDto,
  UpdateInspectionDto,
} from '../../../../../../services/compliance-and-enforcement/chronology/inspection/inspection.dto';
import { ComplianceAndEnforcementChronologyInspectionService } from '../../../../../../services/compliance-and-enforcement/chronology/inspection/inspection.service';
import { AllegedActivity } from '../../../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementDocumentDto } from '../../../../../../services/compliance-and-enforcement/documents/document.dto';
import {
  ComplianceAndEnforcementDocumentService,
  Section,
} from '../../../../../../services/compliance-and-enforcement/documents/document.service';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { UserDto } from '../../../../../../services/user/user.dto';
import { UserService } from '../../../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DocumentUploadDialogComponent } from '../../../../../../shared/document-upload-dialog/document-upload-dialog.component';
import { DocumentDto } from '../../../../../../shared/document-upload-dialog/document-upload-dialog.dto';
import {
  DocumentUploadDialogData,
  DocumentUploadDialogOptions,
} from '../../../../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../../../../shared/document/document.dto';
import { findFileNumberInRouteTree } from '../../../../../../shared/utils/routing';
import { C_E_AUTOSAVE_DEBOUNCE_MS } from '../../../../constants';

type AttendeeForm = FormGroup<{
  name: FormControl<string>;
  organization: FormControl<string>;
}>;

@Component({
  selector: 'app-compliance-and-enforcement-chronology-entry-inspection',
  templateUrl: './inspection.component.html',
  styleUrls: ['./inspection.component.scss'],
  standalone: false,
})
export class ComplianceAndEnforcementChronologyEntryInspectionComponent implements OnInit, OnDestroy {
  documentOptions: DocumentUploadDialogOptions = {
    allowedVisibilityFlags: [],
    allowsFileEdit: true,
    defaultDocumentType: DOCUMENT_TYPE.C_AND_E_INSPECTION,
    defaultDocumentSource: DOCUMENT_SOURCE.ALC,
    typeDisabled: true,
    sourceDisabled: true,
  };

  section = Section.CHRONOLOGY_ENTRY;

  inspectionTypes = Object.values(InspectionType);
  allegedActivities = Object.values(AllegedActivity);

  fileNumber?: string;
  entryUuid?: string;
  entry = computed(() => {
    if (!this.entryUuid) {
      return;
    }

    return this.chronologyService.entriesByUuid().get(this.entryUuid);
  });
  uuid?: string;
  inspection = computed(() => {
    if (!this.uuid) {
      return;
    }

    return this.service.inspectionsByUuid().get(this.uuid);
  });
  officers: UserDto[] = [];

  formIsSubscribed = false;

  form = new FormGroup({
    date: new FormControl<Moment | null>(null, [Validators.required]),
    type: new FormControl<InspectionType | null>(null, [Validators.required]),
    allegedActivity: new FormControl<AllegedActivity[]>([], [Validators.required]),
    officerUuid: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    attendees: new FormArray<AttendeeForm>([]),
    comments: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  showErrors = false;

  $destroy = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly service: ComplianceAndEnforcementChronologyInspectionService,
    private readonly chronologyService: ComplianceAndEnforcementChronologyService,
    private readonly toastService: ToastService,
    private readonly userService: UserService,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly documentService: ComplianceAndEnforcementDocumentService,
    public dialog: MatDialog,
  ) {
    effect(() => {
      if (!this.uuid) {
        return;
      }

      const inspection = this.inspection();

      if (!inspection) {
        return;
      }

      this.fillForm(inspection, false);
    });
  }

  ngOnInit(): void {
    this.fileNumber = findFileNumberInRouteTree(this.route);

    this.route.params
      .pipe(
        map((params) => {
          return params;
        }),
        switchMap(async (params) => {
          // Cast is safe, since uuid required by route
          const { entryUuid, inspectionUuid }: { entryUuid: string; inspectionUuid: string } = params as {
            entryUuid: string;
            inspectionUuid: string;
          };

          // Must come before checking this.entry()
          this.entryUuid = entryUuid;
          if (!this.entry()) {
            this.chronologyService.loadEntries({ filterByUuid: entryUuid }).subscribe();
          }

          // Must come before checking this.inspection()
          this.uuid = inspectionUuid;
          if (!this.inspection()) {
            this.service.loadInspections({ filterByUuid: inspectionUuid }).subscribe();
          }

          this.subscribeFormChanges(inspectionUuid);
        }),
        takeUntil(this.$destroy),
      )
      .subscribe();

    this.loadOfficers();
  }

  fillForm(inspection: InspectionDto, emitEvent: boolean = true): void {
    this.form.reset({}, { emitEvent: false });

    this.form.patchValue(
      {
        date: inspection.date ? moment(inspection.date) : null,
        type: inspection.type,
        allegedActivity: inspection.allegedActivity,
        officerUuid: inspection.officer.uuid,
        comments: inspection.comments,
      },
      { emitEvent },
    );

    this.form.controls.attendees.clear({ emitEvent: false });

    for (const attendee of inspection.attendees) {
      this.addAttendee(attendee, false);
    }
  }

  entryDateText() {
    const timestamp = this.entry()?.date;

    return timestamp ? moment(timestamp).format('YYYY-MM-DD') : 'No Date';
  }

  addAttendee(attendee: Partial<AttendeeDto> = {}, emitEvent: boolean = true): void {
    this.form.controls.attendees.push(
      new FormGroup({
        name: new FormControl<string>(attendee.name ?? '', { nonNullable: true, validators: [Validators.required] }),
        organization: new FormControl<string>(attendee.organization ?? '', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      }) as AttendeeForm,
      { emitEvent },
    );
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
          console.error('Error saving inspection', error);
          this.toastService.showErrorToast('Failed to save inspection');
          return EMPTY;
        }),
        takeUntil(this.$destroy),
      )
      .subscribe(() => {
        this.toastService.showSuccessToast('Inspection saved');
      });
  }

  async loadOfficers() {
    this.officers = await this.userService.getComplianceAndEnforcementOfficers();
  }

  removeAttendee(index: number): void {
    this.form.controls.attendees.removeAt(index);
  }

  async onDeleteButtonClick() {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete the inspection and associated report?`,
      })
      .subscribe(async (accepted) => {
        if (!accepted) {
          return;
        }

        if (!this.uuid) {
          console.error('No inspection UUID found');
          this.toastService.showErrorToast('Failed to delete inspection');
          return;
        }

        try {
          await this.service.delete(this.uuid);
          this.toastService.showSuccessToast('Entry deleted successfully.');
          this.router.navigate(['../../../../..'], { relativeTo: this.route });
        } catch (error) {
          console.error('Error deleting entry:', error);
          this.toastService.showErrorToast('Failed to delete entry.');
        }
      });
  }

  async saveAndExit(isDraft: boolean): Promise<void> {
    const dto = this.dtoFromForm(this.form.value, isDraft);

    if (this.uuid) {
      try {
        await firstValueFrom(this.service.update(this.uuid, dto));
        this.toastService.showSuccessToast('Inspection saved');
      } catch (error) {
        console.error('Error saving inspection', error);
        this.toastService.showErrorToast('Failed to save inspection');
        return;
      }
    }

    this.router.navigate(['../../../../..'], { relativeTo: this.route });
  }

  async onFinishButtonClick() {
    if (this.form.invalid || !this.inspection()?.documents.length) {
      this.form.controls.date.markAsTouched();
      this.form.controls.type.markAsTouched();
      this.form.controls.officerUuid.markAsTouched();
      this.form.controls.allegedActivity.markAsTouched();
      this.form.controls.comments.markAsTouched();

      this.showErrors = true;
    } else {
      this.showErrors = false;

      await this.saveAndExit(false);
    }
  }

  dtoFromForm(formData: typeof this.form.value, isDraft: boolean): UpdateInspectionDto {
    const dto: UpdateInspectionDto = { isDraft };

    if (formData.date) {
      dto.date = formData.date.format('YYYY-MM-DD');
    }

    if (formData.type) {
      dto.type = formData.type;
    }

    if (formData.officerUuid) {
      dto.officerUuid = formData.officerUuid;
    }

    if (formData.allegedActivity) {
      dto.allegedActivity = formData.allegedActivity;
    }

    if (formData.attendees) {
      dto.attendees = formData.attendees?.map((attendee) => {
        const dto: UpdateAttendeeDto = {};

        if (attendee.name) {
          dto.name = attendee.name;
        }
        if (attendee.organization) {
          dto.organization = attendee.organization;
        }

        return dto;
      });
    }

    if (formData.comments) {
      dto.comments = formData.comments;
    }

    return dto;
  }

  openAddCorrespondenceDialog(entryUuid: string | undefined, inspectionUuid: string | undefined): void {
    this.openDocumentDialog({
      chronologyEntryUuid: entryUuid,
      inspectionUuid: inspectionUuid,
    });
  }

  openEditDocumentDialog(document: ComplianceAndEnforcementDocumentDto) {
    this.openDocumentDialog({}, document);
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
          console.error('Failed to reload inspection');
          this.toastService.showErrorToast('Filed to reload inspection');
          return;
        }

        this.service.loadInspections({ filterByUuid: this.uuid }).subscribe();

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

        this.service.loadInspections({ filterByUuid: this.uuid }).subscribe();
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  firstValueFrom,
  skip,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { C_E_AUTOSAVE_DEBOUNCE_MS } from '../constants';
import {
  ComplianceAndEnforcementDto,
  InitialSubmissionType,
} from '../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { OverviewComponent } from '../overview/overview.component';
import { ToastService } from '../../../services/toast/toast.service';
import { FormArray, FormGroup } from '@angular/forms';
import { SubmitterComponent } from '../submitter/submitter.component';
import { ComplianceAndEnforcementSubmitterDto } from '../../../services/compliance-and-enforcement/submitter/submitter.dto';
import { ComplianceAndEnforcementSubmitterService } from '../../../services/compliance-and-enforcement/submitter/submitter.service';
import { PropertyComponent, cleanPropertyUpdate } from '../property/property.component';
import { ComplianceAndEnforcementPropertyDto } from '../../../services/compliance-and-enforcement/property/property.dto';
import { ComplianceAndEnforcementPropertyService } from '../../../services/compliance-and-enforcement/property/property.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../shared/document/document.dto';
import { DocumentUploadDialogData } from '../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { Section } from '../../../services/compliance-and-enforcement/documents/document.service';
import { ResponsiblePartiesComponent } from '../responsible-parties/responsible-parties.component';
import { ResponsiblePartiesService } from '../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

export const submissionDocumentOptions: DocumentUploadDialogData = {
  // A necessary hack to make this work without rewriting lots of code
  fileId: '',
  allowedVisibilityFlags: [],
  allowsFileEdit: true,
  allowedDocumentSources: [
    DOCUMENT_SOURCE.PUBLIC,
    DOCUMENT_SOURCE.LFNG,
    DOCUMENT_SOURCE.BC_GOVERNMENT,
    DOCUMENT_SOURCE.OTHER_AGENCY,
    DOCUMENT_SOURCE.ALC,
  ],
  allowedDocumentTypes: [DOCUMENT_TYPE.COMPLAINT, DOCUMENT_TYPE.REFERRAL],
};

@Component({
  selector: 'app-compliance-and-enforcement-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss'],
})
export class DraftComponent implements OnInit, AfterViewInit, OnDestroy {
  Section = Section;

  submissionDocumentOptions = submissionDocumentOptions;

  ownershipDocumentOptions: DocumentUploadDialogData = {
    // A necessary hack to make this work without rewriting lots of code
    fileId: '',
    parcelService: this.propertyService,
    submissionService: this.responsiblePartyService,
    allowedVisibilityFlags: [],
    allowsFileEdit: true,
    allowedDocumentSources: [
      DOCUMENT_SOURCE.PUBLIC,
      DOCUMENT_SOURCE.LFNG,
      DOCUMENT_SOURCE.BC_GOVERNMENT,
      DOCUMENT_SOURCE.OTHER_AGENCY,
      DOCUMENT_SOURCE.ALC,
    ],
    allowedDocumentTypes: [
      DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
      DOCUMENT_TYPE.CORPORATE_SUMMARY,
      DOCUMENT_TYPE.BC_ASSESSMENT_REPORT,
      DOCUMENT_TYPE.SURVEY_PLAN,
    ],
  };

  $destroy = new Subject<void>();

  fileNumber?: string;
  file?: ComplianceAndEnforcementDto;
  initialSubmissionType?: InitialSubmissionType;
  submitter?: ComplianceAndEnforcementSubmitterDto;
  property?: ComplianceAndEnforcementPropertyDto;
  isPropertyCrown = false;

  form = new FormGroup({});

  @ViewChild(OverviewComponent) overviewComponent?: OverviewComponent;
  @ViewChild(SubmitterComponent) submitterComponent?: SubmitterComponent;
  @ViewChild(PropertyComponent) propertyComponent?: PropertyComponent;
  @ViewChild(ResponsiblePartiesComponent) responsiblePartiesComponent?: ResponsiblePartiesComponent;

  constructor(
    private readonly complianceAndEnforcementService: ComplianceAndEnforcementService,
    private readonly complianceAndEnforcementSubmitterService: ComplianceAndEnforcementSubmitterService,
    private readonly complianceAndEnforcementPropertyService: ComplianceAndEnforcementPropertyService,
    private readonly route: ActivatedRoute,
    private readonly toastService: ToastService,
    private readonly propertyService: ComplianceAndEnforcementPropertyService,
    private readonly responsiblePartyService: ResponsiblePartiesService,
    private readonly router: Router,
    private readonly confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    this.fileNumber = this.route.snapshot.paramMap.get('fileNumber') ?? undefined;

    if (this.fileNumber) {
      this.loadFile(this.fileNumber);
    }
  }

  ngAfterViewInit(): void {
    if (
      !this.overviewComponent ||
      !this.submitterComponent ||
      !this.propertyComponent ||
      !this.responsiblePartiesComponent
    ) {
      console.warn('Not all form sections component not initialized');
      return;
    }

    // Set initial Crown status on responsible parties component
    this.responsiblePartiesComponent.isPropertyCrown = this.isPropertyCrown;

    this.overviewComponent.$changes
      .pipe(
        skip(1), // Skip the initial emission to prevent save on load
        tap((overview) => {
          if (overview.initialSubmissionType) {
            this.initialSubmissionType = overview.initialSubmissionType;
          }
        }),
        debounceTime(C_E_AUTOSAVE_DEBOUNCE_MS),
        switchMap((overview) =>
          this.file?.uuid ? this.complianceAndEnforcementService.update(this.file.uuid, overview) : EMPTY,
        ),
        catchError((error) => {
          console.error('Error saving C&E file draft', error);
          this.toastService.showErrorToast('Failed to save C&E file draft');
          return EMPTY;
        }),
        takeUntil(this.$destroy),
      )
      .subscribe(() => {
        this.toastService.showSuccessToast('C&E file draft saved');
      });

    this.submitterComponent.$changes
      .pipe(
        skip(1), // Skip the initial emission to prevent save on load
        debounceTime(C_E_AUTOSAVE_DEBOUNCE_MS),
        switchMap(([uuid, submitter]) =>
          uuid
            ? this.complianceAndEnforcementSubmitterService.update(uuid, submitter)
            : this.complianceAndEnforcementSubmitterService.create({ ...submitter, fileUuid: this.file?.uuid }),
        ),
        tap((submitter) => {
          this.submitter ??= submitter;
        }),
        catchError((error) => {
          console.error('Error saving C&E submitter draft', error);
          this.toastService.showErrorToast('Failed to save C&E submitter draft');
          return EMPTY;
        }),
        takeUntil(this.$destroy),
      )
      .subscribe(() => {
        this.toastService.showSuccessToast('C&E submitter draft saved');
      });

    this.propertyComponent.$changes
      .pipe(
        skip(1), // Skip the initial emission to prevent save on load
        debounceTime(C_E_AUTOSAVE_DEBOUNCE_MS),
        filter(() => this.propertyComponent?.form.dirty ?? false),
        switchMap((property) => {
          // Only auto-save if there are meaningful changes (non-empty fields)
          const cleanedProperty = cleanPropertyUpdate(property);

          // Check if this is a meaningful ownership type change
          const currentOwnership = this.property?.ownershipTypeCode || 'SMPL';
          const newOwnership = cleanedProperty.ownershipTypeCode;
          const isOwnershipChange = newOwnership !== undefined && newOwnership !== currentOwnership;

          // For non-ownership changes, check if there are other meaningful changes
          const propertyForCheck = { ...cleanedProperty };
          if (propertyForCheck.ownershipTypeCode === 'SMPL') {
            delete propertyForCheck.ownershipTypeCode;
          }

          const hasOtherActualData = Object.values(propertyForCheck).some(
            (value) => value !== null && value !== undefined && value !== '' && value !== 0,
          );

          if (!isOwnershipChange && !hasOtherActualData) {
            return EMPTY; // Prevents saving on empty that was occurring when starting a new file
          }

          if (this.property?.uuid) {
            return this.complianceAndEnforcementPropertyService.update(this.property.uuid, property);
          } else if (this.file?.uuid) {
            return this.complianceAndEnforcementPropertyService.create({
              fileUuid: this.file.uuid,
              ...cleanPropertyUpdate(property),
            });
          } else {
            return EMPTY;
          }
        }),
        tap((property) => {
          if (!this.property) {
            this.property = property;
          }
          this.propertyComponent?.form.markAsPristine();
        }),
        catchError((error) => {
          console.error('Error saving C&E property draft', error);
          this.toastService.showErrorToast('Failed to save C&E property draft');
          return EMPTY;
        }),
        takeUntil(this.$destroy),
      )
      .subscribe(() => {
        this.toastService.showSuccessToast('C&E property draft saved');
      });

    // Watch for property ownership changes to update Crown status
    this.propertyComponent.$changes.pipe(takeUntil(this.$destroy)).subscribe(async (propertyUpdate) => {
      if (this.ownershipDocumentOptions.fixedParcel) {
        this.ownershipDocumentOptions.fixedParcel.pid = propertyUpdate.pid ?? undefined;
      }

      if (propertyUpdate.ownershipTypeCode) {
        const wasCrown = this.isPropertyCrown;
        this.isPropertyCrown = propertyUpdate.ownershipTypeCode === 'CRWN';

        // If Crown status changed, update responsible parties component
        if (wasCrown !== this.isPropertyCrown && this.responsiblePartiesComponent) {
          this.responsiblePartiesComponent.isPropertyCrown = this.isPropertyCrown;

          await this.responsiblePartiesComponent.loadResponsibleParties();
        }
      }
    });
  }

  async loadFile(fileNumber: string) {
    try {
      this.file = await this.complianceAndEnforcementService.fetchByFileNumber(fileNumber, { withSubmitters: true });
      this.submitter = this.file.submitters[0];
      this.initialSubmissionType = this.file.initialSubmissionType ?? undefined;

      // Load property data
      if (this.file.uuid) {
        try {
          const properties = await this.complianceAndEnforcementPropertyService.fetchByFileUuid(this.file.uuid);
          this.property = properties[0];

          this.ownershipDocumentOptions.fixedParcel = this.property;

          if (this.propertyComponent && this.property) {
            this.propertyComponent.property = this.property;
          }
          // Check if property is Crown ownership
          this.isPropertyCrown = this.property?.ownershipTypeCode === 'CRWN';

          // Set the Crown status on the responsible parties component and load parties
          if (this.responsiblePartiesComponent) {
            this.responsiblePartiesComponent.isPropertyCrown = this.isPropertyCrown;
            // Manually trigger loading since the component's ngOnInit ran before file was loaded up
            if (this.file?.uuid) {
              this.responsiblePartiesComponent.fileUuid = this.file.uuid;
              await this.responsiblePartiesComponent.loadResponsibleParties();
            }
          }
        } catch (error: any) {
          // Property might not exist yet (404 is expected)
          if (error.status !== 404) {
            console.error('Error loading property data', error);
            this.toastService.showErrorToast('Failed to load property data');
          }
          this.property = undefined;
          this.isPropertyCrown = false;
        }
      }
    } catch (error) {
      console.error('Error loading C&E file', error);
      this.toastService.showErrorToast('Failed to load C&E file');
    }
  }

  async clearAllResponsibleParties() {
    if (!this.responsiblePartiesComponent) {
      return;
    }

    await this.responsiblePartiesComponent.clearAllParties();
  }

  async onSaveDraftClicked() {
    if (!this.overviewComponent || !this.submitterComponent || !this.propertyComponent || !this.file?.uuid) {
      return;
    }

    const overviewUpdate = this.overviewComponent.$changes.getValue();
    const [submitterUuid, submitterUpdate] = this.submitterComponent.$changes.getValue();
    const propertyUpdate = this.propertyComponent.$changes.getValue();

    try {
      await firstValueFrom(this.complianceAndEnforcementService.update(this.file.uuid, overviewUpdate));

      if (submitterUuid) {
        await firstValueFrom(this.complianceAndEnforcementSubmitterService.update(submitterUuid, submitterUpdate));
      } else {
        this.submitter = await firstValueFrom(this.complianceAndEnforcementSubmitterService.create(submitterUpdate));
      }

      if (this.property?.uuid) {
        await firstValueFrom(this.complianceAndEnforcementPropertyService.update(this.property.uuid, propertyUpdate));
      } else {
        this.property = await firstValueFrom(
          this.complianceAndEnforcementPropertyService.create({
            fileUuid: this.file.uuid,
            ...cleanPropertyUpdate(propertyUpdate),
          }),
        );
      }

      this.toastService.showSuccessToast('C&E file draft saved');
      await this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error saving C&E file draft', error);
      this.toastService.showErrorToast('Failed to save C&E file draft');
    }
  }

  async onCancelDiscardClicked() {
    const dialogRef = this.confirmationDialogService.openDialog({
      title: 'Discard Draft',
      body: 'Are you sure you want to discard this draft? All data will be permanently deleted.',
      yesButtonText: 'Discard',
      cancelButtonText: 'Cancel',
    });

    dialogRef.subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      if (!this.file?.uuid) {
        await this.router.navigate(['/home']);
        return;
      }

      try {
        await this.complianceAndEnforcementService.delete(this.file.uuid);
        this.toastService.showSuccessToast('Draft discarded');
      } catch (error) {
        console.error('Error discarding C&E draft', error);
        this.toastService.showErrorToast('Failed to discard draft');
      } finally {
        await this.router.navigate(['/home']);
      }
    });
  }

  async onFinishCreateFileClicked() {
    // Ensure child components and file exist
    if (!this.overviewComponent || !this.submitterComponent || !this.propertyComponent || !this.file?.uuid || !this.responsiblePartiesComponent) {
      this.toastService.showErrorToast('Something went wrong, please refresh the page and try again');
      return;
    }

    // Trigger validation across all child forms
    const controlsToValidate: FormGroup[] = [
      this.overviewComponent.form,
      this.submitterComponent.form,
      this.propertyComponent.form,
    ];

    controlsToValidate.forEach((fg) => {
      fg.markAllAsTouched();
      fg.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });

    // Ensure property local government display control syncs validation (may have to go back to the local gov validation)
    try {
      this.propertyComponent.onLocalGovernmentBlur();
    } catch {}
    this.propertyComponent.localGovernmentControl.markAsTouched();
    this.propertyComponent.localGovernmentControl.updateValueAndValidity({ onlySelf: false, emitEvent: false });

    // Trigger validation for Responsible Parties form array and nested director forms
    if (this.responsiblePartiesComponent?.form) {
      this.responsiblePartiesComponent.form.controls.forEach((group) => {
        group.markAllAsTouched();
        group.updateValueAndValidity({ onlySelf: false, emitEvent: false });
        const directors = group.get('directors') as FormArray | null;
        directors?.controls.forEach((dg) => {
          dg.markAllAsTouched();
          dg.updateValueAndValidity({ onlySelf: false, emitEvent: false });
        });
      });
    }

    // Validate that at least one responsible party is added
    const hasValidResponsibleParties = this.responsiblePartiesComponent?.validateRequiredParties() ?? false;

    // If any form is invalid, show error toast and scroll to first error
    const hasInvalid =
      controlsToValidate.some((fg) => fg.invalid) ||
      this.propertyComponent.localGovernmentControl.invalid ||
      (this.responsiblePartiesComponent?.form.controls.some((g) => g.invalid) ?? false) ||
      !hasValidResponsibleParties;
    if (hasInvalid) {
      this.toastService.showErrorToast('Please correct all errors before submitting the form');
      // Attempt to scroll to first element with .ng-invalid within the form ( will check with SO if this is necessary)
      
        const el = document.getElementsByClassName('ng-invalid');
        if (el && el.length > 0) {
          const target = Array.from(el).find((n) => n.nodeName !== 'FORM') as HTMLElement | undefined;
          target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      
      return;
    }

    // Persist latest values before finalizing (same as save but without navigate)
    const overviewUpdate = this.overviewComponent.$changes.getValue();
    const [_, submitterUpdate] = this.submitterComponent.$changes.getValue();
    const propertyUpdate = this.propertyComponent.$changes.getValue();

    try {
      await firstValueFrom(this.complianceAndEnforcementService.update(this.file.uuid, overviewUpdate));

      if (this.submitter?.uuid) {
        await firstValueFrom(this.complianceAndEnforcementSubmitterService.update(this.submitter.uuid, submitterUpdate));
      } else {
        this.submitter = await firstValueFrom(this.complianceAndEnforcementSubmitterService.create({
          ...submitterUpdate,
          fileUuid: this.file.uuid,
        }));
      }

      if (this.property?.uuid) {
        await firstValueFrom(this.complianceAndEnforcementPropertyService.update(this.property.uuid, propertyUpdate));
      } else {
        this.property = await firstValueFrom(
          this.complianceAndEnforcementPropertyService.create({
            fileUuid: this.file.uuid,
            ...cleanPropertyUpdate(propertyUpdate),
          }),
        );
      }

      // Mark file as submitted
      await firstValueFrom(this.complianceAndEnforcementService.update(this.file.uuid, { 
        dateOpened: Date.now() 
      }));
            // Now submit the form - this will run backend validation
      await this.complianceAndEnforcementService.submit(this.file.uuid);

      this.toastService.showSuccessToast('C&E file created');
      await this.router.navigate(['/compliance-and-enforcement', this.file.fileNumber]);
    } catch (error: any) {
      // Check if it's a validation error from the backend
      if (error.status === 400 && error.error?.message?.includes('Validation failed')) {
        this.toastService.showErrorToast('Please correct all errors before submitting the form');
        
        // Trigger client-side validation to show field errors
        this.triggerClientSideValidation();
        
        // Scroll to first error
        setTimeout(() => {
          const el = document.getElementsByClassName('ng-invalid');
          if (el && el.length > 0) {
            const target = Array.from(el).find((n) => n.nodeName !== 'FORM') as HTMLElement | undefined;
            target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        this.toastService.showErrorToast('Failed to create C&E file. Please try again.');
      }
    }
  }

  private triggerClientSideValidation() {
    // Trigger validation across all child forms to show field errors
    const controlsToValidate: FormGroup[] = [
      this.overviewComponent?.form,
      this.submitterComponent?.form,
      this.propertyComponent?.form,
    ].filter(Boolean) as FormGroup[];

    controlsToValidate.forEach((fg) => {
      fg.markAllAsTouched();
      fg.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });

    // Ensure property local government display control syncs validation
    if (this.propertyComponent) {
      try {
        this.propertyComponent.onLocalGovernmentBlur();
      } catch (error) {
        // Local government blur validation failed, continue
      }
      this.propertyComponent.localGovernmentControl.markAsTouched();
      this.propertyComponent.localGovernmentControl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    }

    // Trigger validation for Responsible Parties form array and nested director forms
    if (this.responsiblePartiesComponent?.form) {
      this.responsiblePartiesComponent.form.controls.forEach((group) => {
        group.markAllAsTouched();
        group.updateValueAndValidity({ onlySelf: false, emitEvent: false });
        
        const directors = group.get('directors') as FormArray | null;
        if (directors) {
          directors.controls.forEach((dg) => {
            dg.markAllAsTouched();
            dg.updateValueAndValidity({ onlySelf: false, emitEvent: false });
          });
        }
      });
    }
  }

  registerFormGroup({ name, formGroup }: { name: string; formGroup: FormGroup }) {
    this.form.addControl(name, formGroup);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, EMPTY, firstValueFrom, skip, Subject, switchMap, takeUntil, tap } from 'rxjs';
import {
  ComplianceAndEnforcementDto,
  InitialSubmissionType,
} from '../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { OverviewComponent } from '../overview/overview.component';
import { ToastService } from '../../../services/toast/toast.service';
import { FormGroup } from '@angular/forms';
import { SubmitterComponent } from '../submitter/submitter.component';
import { ComplianceAndEnforcementSubmitterDto } from '../../../services/compliance-and-enforcement/submitter/submitter.dto';
import { ComplianceAndEnforcementSubmitterService } from '../../../services/compliance-and-enforcement/submitter/submitter.service';
import { PropertyComponent, cleanPropertyUpdate } from '../property/property.component';
import { ComplianceAndEnforcementPropertyDto } from '../../../services/compliance-and-enforcement/property/property.dto';
import { ComplianceAndEnforcementPropertyService } from '../../../services/compliance-and-enforcement/property/property.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../shared/document/document.dto';
import { DocumentUploadDialogOptions } from '../../../shared/document-upload-dialog/document-upload-dialog.interface';
import { Section } from '../../../services/compliance-and-enforcement/documents/document.service';
import { ResponsiblePartiesComponent } from '../responsible-parties/responsible-parties.component';

@Component({
  selector: 'app-compliance-and-enforcement-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.scss'],
})
export class DraftComponent implements OnInit, AfterViewInit, OnDestroy {
  Section = Section;

  submissionDocumentOptions: DocumentUploadDialogOptions = {
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

  $destroy = new Subject<void>();

  fileNumber?: string;
  file?: ComplianceAndEnforcementDto;
  initialSubmissionType?: InitialSubmissionType;
  submitter?: ComplianceAndEnforcementSubmitterDto;
  property?: ComplianceAndEnforcementPropertyDto;
  isPropertyCrown = false;

  form = new FormGroup({ overview: new FormGroup({}), submitter: new FormGroup({}), property: new FormGroup({}) });

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
  ) {}

  ngOnInit(): void {
    this.fileNumber = this.route.snapshot.paramMap.get('fileNumber') ?? undefined;

    if (this.fileNumber) {
      this.loadFile(this.fileNumber);
    }
  }

  ngAfterViewInit(): void {
    if (!this.overviewComponent || !this.submitterComponent || !this.propertyComponent || !this.responsiblePartiesComponent) {
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
        debounceTime(1000),
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
        debounceTime(1000),
        switchMap((submitter) =>
          this.submitter?.uuid
            ? this.complianceAndEnforcementSubmitterService.update(this.submitter.uuid, submitter)
            : this.complianceAndEnforcementSubmitterService.create({ ...submitter, fileUuid: this.file?.uuid }),
        ),
        tap((submitter) => {
          if (!this.submitter) {
            this.submitter = submitter;
          }
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
        debounceTime(1000),
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
    this.propertyComponent.$changes
      .pipe(
        takeUntil(this.$destroy),
      )
      .subscribe(async (propertyUpdate) => {
        if (propertyUpdate.ownershipTypeCode) {
          const wasCrown = this.isPropertyCrown;
          this.isPropertyCrown = propertyUpdate.ownershipTypeCode === 'CRWN';
          
          // If Crown status changed, update responsible parties component
          if (wasCrown !== this.isPropertyCrown && this.responsiblePartiesComponent) {
            this.responsiblePartiesComponent.isPropertyCrown = this.isPropertyCrown;
            
            if (this.isPropertyCrown) {
              // For Crown properties, clear all existing parties since they are not allowed in CRWN ownership
              await this.clearAllResponsibleParties();
            } else {
              // For non-Crown properties, reload parties from API and ensure form is rebuilt
              await this.responsiblePartiesComponent.loadResponsibleParties();
              // Refresh the form to ensure proper state (will add default party if none exist)
              this.responsiblePartiesComponent.refreshFormForPropertyChange();
            }
          }
        }
      });
  }

  async loadFile(fileNumber: string) {
    try {
      this.file = await this.complianceAndEnforcementService.fetchByFileNumber(fileNumber, true);
      this.submitter = this.file.submitters[0];
      this.initialSubmissionType = this.file.initialSubmissionType ?? undefined;

      // Load property data
      if (this.file.uuid) {
        try {
          this.property = await this.complianceAndEnforcementPropertyService.fetchByFileUuid(this.file.uuid);
          
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
    const submitterUpdate = this.submitterComponent.$changes.getValue();
    const propertyUpdate = this.propertyComponent.$changes.getValue();

    try {
      await firstValueFrom(this.complianceAndEnforcementService.update(this.file.uuid, overviewUpdate));

      if (this.submitter?.uuid) {
        await firstValueFrom(
          this.complianceAndEnforcementSubmitterService.update(this.submitter.uuid, submitterUpdate),
        );
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
    } catch (error) {
      console.error('Error saving C&E file draft', error);
      this.toastService.showErrorToast('Failed to save C&E file draft');
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}

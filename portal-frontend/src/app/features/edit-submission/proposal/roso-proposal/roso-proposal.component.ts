import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  DOCUMENT_TYPE,
} from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../../edit-submission.component';
import { StepComponent } from '../../step.partial';
import { SoilTableData } from './soil-table/soil-table.component';

@Component({
  selector: 'app-roso-proposal',
  templateUrl: './roso-proposal.component.html',
  styleUrls: ['./roso-proposal.component.scss'],
})
export class RosoProposalComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;

  DOCUMENT = DOCUMENT_TYPE;

  proposalMap: ApplicationDocumentDto[] = [];
  crossSections: ApplicationDocumentDto[] = [];
  reclamationPlan: ApplicationDocumentDto[] = [];

  isNOIFollowUp = new FormControl<string | null>(null, [Validators.required]);
  NOIIDs = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  hasALCAuthorization = new FormControl<string | null>(null, [Validators.required]);
  applicationIDs = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  soilTypeRemoved = new FormControl<string | null>(null, [Validators.required]);
  reduceNegativeImpacts = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    isNOIFollowUp: this.isNOIFollowUp,
    NOIIDs: this.NOIIDs,
    hasALCAuthorization: this.hasALCAuthorization,
    applicationIDs: this.applicationIDs,
    purpose: this.purpose,
    soilTypeRemoved: this.soilTypeRemoved,
    reduceNegativeImpacts: this.reduceNegativeImpacts,
  });
  private fileId = '';
  private submissionUuid = '';
  removalTableData: SoilTableData = {};
  alreadyRemovedTableData: SoilTableData = {};

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService
  ) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.alreadyRemovedTableData = {
          volume: applicationSubmission.soilAlreadyRemovedVolume ?? 0,
          area: applicationSubmission.soilAlreadyRemovedArea ?? 0,
          averageDepth: applicationSubmission.soilAlreadyRemovedAverageDepth ?? 0,
          maximumDepth: applicationSubmission.soilAlreadyRemovedMaximumDepth ?? 0,
        };

        this.removalTableData = {
          volume: applicationSubmission.soilToRemoveVolume ?? undefined,
          area: applicationSubmission.soilToRemoveArea ?? undefined,
          averageDepth: applicationSubmission.soilToRemoveAverageDepth ?? undefined,
          maximumDepth: applicationSubmission.soilToRemoveMaximumDepth ?? undefined,
        };

        let isNOIFollowUp = null;
        if (applicationSubmission.soilIsNOIFollowUp !== null) {
          isNOIFollowUp = applicationSubmission.soilIsNOIFollowUp ? 'true' : 'false';
          if (isNOIFollowUp) {
            this.NOIIDs.enable();
          }
        }

        let hasALCAuthorization = null;
        if (applicationSubmission.soilHasPreviousALCAuthorization !== null) {
          hasALCAuthorization = applicationSubmission.soilHasPreviousALCAuthorization ? 'true' : 'false';
          if (hasALCAuthorization) {
            this.applicationIDs.enable();
          }
        }

        this.form.patchValue({
          isNOIFollowUp: isNOIFollowUp,
          hasALCAuthorization: hasALCAuthorization,
          NOIIDs: applicationSubmission.soilNOIIDs,
          applicationIDs: applicationSubmission.soilApplicationIDs,
          purpose: applicationSubmission.soilPurpose,
          soilTypeRemoved: applicationSubmission.soilTypeRemoved,
          reduceNegativeImpacts: applicationSubmission.soilReduceNegativeImpacts,
        });
        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
      this.reclamationPlan = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN);
    });
  }

  async onSave() {
    await this.save();
  }

  async attachFile(file: FileHandle, documentType: DOCUMENT_TYPE) {
    if (this.fileId) {
      await this.save();
      const mappedFiles = file.file;
      await this.applicationDocumentService.attachExternalFile(this.fileId, mappedFiles, documentType);
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    await this.applicationDocumentService.deleteExternalFile($event.uuid);
    if (this.fileId) {
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  private async save() {
    if (this.fileId) {
      const isNOIFollowUp = this.isNOIFollowUp.getRawValue();
      const soilNOIIDs = this.NOIIDs.getRawValue();
      const hasALCAuthorization = this.hasALCAuthorization.getRawValue();
      const soilApplicationIDs = this.applicationIDs.getRawValue();
      const soilPurpose = this.purpose.getRawValue();
      const soilTypeRemoved = this.soilTypeRemoved.getRawValue();
      const soilReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        soilPurpose,
        soilTypeRemoved,
        soilReduceNegativeImpacts,
        soilIsNOIFollowUp: isNOIFollowUp !== null ? isNOIFollowUp === 'true' : null,
        soilNOIIDs,
        soilHasPreviousALCAuthorization: hasALCAuthorization !== null ? hasALCAuthorization === 'true' : null,
        soilApplicationIDs,
        soilToRemoveVolume: this.removalTableData?.volume ?? null,
        soilToRemoveArea: this.removalTableData?.area ?? null,
        soilToRemoveMaximumDepth: this.removalTableData?.maximumDepth ?? null,
        soilToRemoveAverageDepth: this.removalTableData?.averageDepth ?? null,
        soilAlreadyRemovedVolume: this.alreadyRemovedTableData?.volume ?? null,
        soilAlreadyRemovedArea: this.alreadyRemovedTableData?.area ?? null,
        soilAlreadyRemovedMaximumDepth: this.alreadyRemovedTableData?.maximumDepth ?? null,
        soilAlreadyRemovedAverageDepth: this.alreadyRemovedTableData?.averageDepth ?? null,
      };

      const updatedApp = await this.applicationService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onChangeNOI(selectedValue: string) {
    if (selectedValue === 'true') {
      this.NOIIDs.enable();
    } else {
      this.NOIIDs.disable();
      this.NOIIDs.setValue(null);
    }
  }

  onChangeALCAuthorization(selectedValue: string) {
    if (selectedValue === 'true') {
      this.applicationIDs.enable();
    } else {
      this.applicationIDs.disable();
      this.applicationIDs.setValue(null);
    }
  }
}

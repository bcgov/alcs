import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  DOCUMENT_TYPE,
} from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { SoilTableData } from '../soil-table/soil-table.component';

@Component({
  selector: 'app-pofo-proposal',
  templateUrl: './pofo-proposal.component.html',
  styleUrls: ['./pofo-proposal.component.scss'],
})
export class PofoProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;
  DOCUMENT = DOCUMENT_TYPE;

  proposalMap: ApplicationDocumentDto[] = [];
  crossSections: ApplicationDocumentDto[] = [];
  reclamationPlan: ApplicationDocumentDto[] = [];

  isNOIFollowUp = new FormControl<string | null>(null, [Validators.required]);
  NOIIDs = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  hasALCAuthorization = new FormControl<string | null>(null, [Validators.required]);
  applicationIDs = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  fillTypeToPlace = new FormControl<string | null>(null, [Validators.required]);
  reduceNegativeImpacts = new FormControl<string | null>(null, [Validators.required]);
  alternativeMeasures = new FormControl<string | null>(null, [Validators.required]);
  projectDurationAmount = new FormControl<string | null>(null, [Validators.required]);
  projectDurationUnit = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    isNOIFollowUp: this.isNOIFollowUp,
    NOIIDs: this.NOIIDs,
    hasALCAuthorization: this.hasALCAuthorization,
    applicationIDs: this.applicationIDs,
    purpose: this.purpose,
    fillTypeToPlace: this.fillTypeToPlace,
    alternativeMeasures: this.alternativeMeasures,
    reduceNegativeImpacts: this.reduceNegativeImpacts,
    projectDurationAmount: this.projectDurationAmount,
    projectDurationUnit: this.projectDurationUnit,
  });

  private submissionUuid = '';
  private areComponentsDirty = false;
  fillTableData: SoilTableData = {};
  alreadyFilledTableData: SoilTableData = {};

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog
  ) {
    super(applicationDocumentService, dialog);
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.alreadyFilledTableData = {
          volume: applicationSubmission.soilAlreadyPlacedVolume ?? 0,
          area: applicationSubmission.soilAlreadyPlacedArea ?? 0,
          averageDepth: applicationSubmission.soilAlreadyPlacedAverageDepth ?? 0,
          maximumDepth: applicationSubmission.soilAlreadyPlacedMaximumDepth ?? 0,
        };

        this.fillTableData = {
          volume: applicationSubmission.soilToPlaceVolume ?? undefined,
          area: applicationSubmission.soilToPlaceArea ?? undefined,
          averageDepth: applicationSubmission.soilToPlaceAverageDepth ?? undefined,
          maximumDepth: applicationSubmission.soilToPlaceMaximumDepth ?? undefined,
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
          purpose: applicationSubmission.purpose,
          fillTypeToPlace: applicationSubmission.soilFillTypeToPlace,
          alternativeMeasures: applicationSubmission.soilAlternativeMeasures,
          reduceNegativeImpacts: applicationSubmission.soilReduceNegativeImpacts,
          projectDurationAmount: applicationSubmission.soilProjectDurationAmount?.toString() ?? null,
          projectDurationUnit: applicationSubmission.soilProjectDurationUnit,
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

  protected async save() {
    if (this.fileId && this.form.dirty) {
      const isNOIFollowUp = this.isNOIFollowUp.getRawValue();
      const soilNOIIDs = this.NOIIDs.getRawValue();
      const hasALCAuthorization = this.hasALCAuthorization.getRawValue();
      const soilApplicationIDs = this.applicationIDs.getRawValue();
      const purpose = this.purpose.getRawValue();
      const soilFillTypeToPlace = this.fillTypeToPlace.getRawValue();
      const soilAlternativeMeasures = this.alternativeMeasures.getRawValue();
      const soilReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        purpose,
        soilFillTypeToPlace,
        soilAlternativeMeasures,
        soilReduceNegativeImpacts,
        soilIsNOIFollowUp: parseStringToBoolean(isNOIFollowUp),
        soilNOIIDs,
        soilHasPreviousALCAuthorization: parseStringToBoolean(hasALCAuthorization),
        soilApplicationIDs,
        soilToPlaceVolume: this.fillTableData?.volume ?? null,
        soilToPlaceArea: this.fillTableData?.area ?? null,
        soilToPlaceMaximumDepth: this.fillTableData?.maximumDepth ?? null,
        soilToPlaceAverageDepth: this.fillTableData?.averageDepth ?? null,
        soilAlreadyPlacedVolume: this.alreadyFilledTableData?.volume ?? null,
        soilAlreadyPlacedArea: this.alreadyFilledTableData?.area ?? null,
        soilAlreadyPlacedMaximumDepth: this.alreadyFilledTableData?.maximumDepth ?? null,
        soilAlreadyPlacedAverageDepth: this.alreadyFilledTableData?.averageDepth ?? null,
        soilProjectDurationAmount: this.projectDurationAmount.value
          ? parseFloat(this.projectDurationAmount.value)
          : null,
        soilProjectDurationUnit: this.projectDurationUnit.value,
      };

      const updatedApp = await this.applicationService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onChangeNOI(selectedValue: string) {
    if (selectedValue === 'true') {
      this.NOIIDs.enable();
    } else if (selectedValue === 'false') {
      this.NOIIDs.disable();
      this.NOIIDs.setValue(null);
    }
  }

  onChangeALCAuthorization(selectedValue: string) {
    if (selectedValue === 'true') {
      this.applicationIDs.enable();
    } else if (selectedValue === 'false') {
      this.applicationIDs.disable();
      this.applicationIDs.setValue(null);
    }
  }

  markDirty() {
    this.areComponentsDirty = true;
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';

@Component({
  selector: 'app-roso-proposal',
  templateUrl: './roso-proposal.component.html',
  styleUrls: ['./roso-proposal.component.scss'],
})
export class RosoProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  DOCUMENT = DOCUMENT_TYPE;

  proposalMap: ApplicationDocumentDto[] = [];
  crossSections: ApplicationDocumentDto[] = [];
  reclamationPlan: ApplicationDocumentDto[] = [];

  showProposalMapVirus = false;
  showCrossSectionVirus = false;
  showReclamationPlanVirus = false;

  isFollowUp = new FormControl<string | null>(null, [Validators.required]);
  followUpIds = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  soilTypeRemoved = new FormControl<string | null>(null, [Validators.required]);
  reduceNegativeImpacts = new FormControl<string | null>(null, [Validators.required]);
  projectDuration = new FormControl<string | null>(null, [Validators.required]);
  areComponentsDirty = false;

  form = new FormGroup({
    isFollowUp: this.isFollowUp,
    followUpIds: this.followUpIds,
    purpose: this.purpose,
    soilTypeRemoved: this.soilTypeRemoved,
    reduceNegativeImpacts: this.reduceNegativeImpacts,
    projectDuration: this.projectDuration,
  });

  private submissionUuid = '';
  removalTableData: SoilTableData = {};
  alreadyRemovedTableData: SoilTableData = {};

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    toastService: ToastService
  ) {
    super(applicationDocumentService, dialog, toastService);
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

        if (applicationSubmission.soilIsFollowUp) {
          this.followUpIds.enable();
        }

        this.form.patchValue({
          isFollowUp: formatBooleanToString(applicationSubmission.soilIsFollowUp),
          followUpIds: applicationSubmission.soilFollowUpIDs,
          purpose: applicationSubmission.purpose,
          soilTypeRemoved: applicationSubmission.soilTypeRemoved,
          reduceNegativeImpacts: applicationSubmission.soilReduceNegativeImpacts,
          projectDuration: applicationSubmission.soilProjectDuration,
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

  async attachProposalMap(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
    this.showProposalMapVirus = !res;
  }

  async attachCrossSection(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.CROSS_SECTIONS);
    this.showCrossSectionVirus = !res;
  }

  async attachReclamationPlan(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.RECLAMATION_PLAN);
    this.showReclamationPlanVirus = !res;
  }

  protected async save() {
    if (this.fileId && (this.form.dirty || this.areComponentsDirty)) {
      const isNOIFollowUp = this.isFollowUp.getRawValue();
      const soilFollowUpIDs = this.followUpIds.getRawValue();
      const purpose = this.purpose.getRawValue();
      const soilTypeRemoved = this.soilTypeRemoved.getRawValue();
      const soilReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        purpose,
        soilTypeRemoved,
        soilReduceNegativeImpacts,
        soilIsFollowUp: parseStringToBoolean(isNOIFollowUp),
        soilFollowUpIDs,
        soilToRemoveVolume: this.removalTableData?.volume ?? null,
        soilToRemoveArea: this.removalTableData?.area ?? null,
        soilToRemoveMaximumDepth: this.removalTableData?.maximumDepth ?? null,
        soilToRemoveAverageDepth: this.removalTableData?.averageDepth ?? null,
        soilAlreadyRemovedVolume: this.alreadyRemovedTableData?.volume ?? null,
        soilAlreadyRemovedArea: this.alreadyRemovedTableData?.area ?? null,
        soilAlreadyRemovedMaximumDepth: this.alreadyRemovedTableData?.maximumDepth ?? null,
        soilAlreadyRemovedAverageDepth: this.alreadyRemovedTableData?.averageDepth ?? null,
        soilProjectDuration: this.projectDuration.value,
      };

      const updatedApp = await this.applicationService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onChangeIsFollowUp(selectedValue: string) {
    if (selectedValue === 'true') {
      this.followUpIds.enable();
    } else if (selectedValue === 'false') {
      this.followUpIds.disable();
      this.followUpIds.setValue(null);
    }
  }

  markDirty() {
    this.areComponentsDirty = true;
  }
}

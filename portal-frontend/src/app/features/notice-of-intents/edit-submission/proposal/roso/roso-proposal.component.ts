import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionUpdateDto } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import { EditNoiSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';

@Component({
  selector: 'app-roso-proposal',
  templateUrl: './roso-proposal.component.html',
  styleUrls: ['./roso-proposal.component.scss'],
})
export class RosoProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNoiSteps.Proposal;

  DOCUMENT = DOCUMENT_TYPE;

  allowMiningUploads = false;
  requiresNoticeOfWork = false;

  proposalMap: NoticeOfIntentDocumentDto[] = [];
  crossSections: NoticeOfIntentDocumentDto[] = [];
  reclamationPlan: NoticeOfIntentDocumentDto[] = [];
  noticeOfWork: NoticeOfIntentDocumentDto[] = [];

  isFollowUp = new FormControl<string | null>(null, [Validators.required]);
  followUpIds = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  soilTypeRemoved = new FormControl<string | null>(null, [Validators.required]);
  projectDurationAmount = new FormControl<string | null>(null, [Validators.required]);
  projectDurationUnit = new FormControl<string | null>(null, [Validators.required]);
  areComponentsDirty = false;
  isExtractionOrMining = new FormControl<string | null>(null, [Validators.required]);
  hasSubmittedNotice = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    isFollowUp: this.isFollowUp,
    followUpIds: this.followUpIds,
    purpose: this.purpose,
    soilTypeRemoved: this.soilTypeRemoved,
    projectDurationAmount: this.projectDurationAmount,
    projectDurationUnit: this.projectDurationUnit,
    isExtractionOrMining: this.isExtractionOrMining,
    hasSubmittedNotice: this.hasSubmittedNotice,
  });

  private submissionUuid = '';
  removalTableData: SoilTableData = {};
  alreadyRemovedTableData: SoilTableData = {};

  constructor(
    private router: Router,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    dialog: MatDialog
  ) {
    super(noticeOfIntentDocumentService, dialog);
  }

  ngOnInit(): void {
    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
        this.submissionUuid = noiSubmission.uuid;

        this.alreadyRemovedTableData = {
          volume: noiSubmission.soilAlreadyRemovedVolume ?? 0,
          area: noiSubmission.soilAlreadyRemovedArea ?? 0,
          averageDepth: noiSubmission.soilAlreadyRemovedAverageDepth ?? 0,
          maximumDepth: noiSubmission.soilAlreadyRemovedMaximumDepth ?? 0,
        };

        this.removalTableData = {
          volume: noiSubmission.soilToRemoveVolume ?? undefined,
          area: noiSubmission.soilToRemoveArea ?? undefined,
          averageDepth: noiSubmission.soilToRemoveAverageDepth ?? undefined,
          maximumDepth: noiSubmission.soilToRemoveMaximumDepth ?? undefined,
        };

        if (noiSubmission.soilIsFollowUp) {
          this.followUpIds.enable();
        }

        if (noiSubmission.soilIsExtractionOrMining) {
          this.allowMiningUploads = true;
          this.hasSubmittedNotice.enable();
        } else {
          this.hasSubmittedNotice.disable();
        }

        this.form.patchValue({
          isFollowUp: formatBooleanToString(noiSubmission.soilIsFollowUp),
          followUpIds: noiSubmission.soilFollowUpIDs,
          purpose: noiSubmission.purpose,
          soilTypeRemoved: noiSubmission.soilTypeRemoved,
          projectDurationAmount: noiSubmission.soilProjectDurationAmount?.toString() ?? null,
          projectDurationUnit: noiSubmission.soilProjectDurationUnit,
          isExtractionOrMining: formatBooleanToString(noiSubmission.soilIsExtractionOrMining),
          hasSubmittedNotice: formatBooleanToString(noiSubmission.soilHasSubmittedNotice),
        });
        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$noiDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
      this.reclamationPlan = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN);
      this.noticeOfWork = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.NOTICE_OF_WORK);
    });
  }

  async onSave() {
    await this.save();
  }

  protected async save() {
    if (this.fileId && this.form.dirty) {
      const isNOIFollowUp = this.isFollowUp.getRawValue();
      const soilFollowUpIDs = this.followUpIds.getRawValue();
      const purpose = this.purpose.getRawValue();
      const soilTypeRemoved = this.soilTypeRemoved.getRawValue();
      const isExtractionOrMining = this.isExtractionOrMining.getRawValue();
      const hasSubmittedNotice = this.hasSubmittedNotice.getRawValue();

      const updateDto: NoticeOfIntentSubmissionUpdateDto = {
        purpose,
        soilTypeRemoved,
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
        soilProjectDurationAmount: this.projectDurationAmount.value
          ? parseFloat(this.projectDurationAmount.value)
          : null,
        soilProjectDurationUnit: this.projectDurationUnit.value,
        soilIsExtractionOrMining: parseStringToBoolean(isExtractionOrMining),
        soilHasSubmittedNotice: parseStringToBoolean(hasSubmittedNotice),
      };

      const updatedApp = await this.noticeOfIntentSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$noiSubmission.next(updatedApp);
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

  onChangeIsExtractionOrMining(selectedValue: string) {
    this.allowMiningUploads = selectedValue === 'true';
    if (selectedValue === 'true') {
      this.hasSubmittedNotice.enable();
    } else {
      this.hasSubmittedNotice.disable();
    }
  }

  markDirty() {
    this.areComponentsDirty = true;
  }

  onChangeNoticeOfWork(selectedValue: string) {
    this.requiresNoticeOfWork = selectedValue === 'true';
  }
}

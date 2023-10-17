import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionUpdateDto } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import { EditNoiSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';

@Component({
  selector: 'app-pfrs-proposal',
  templateUrl: './pfrs-proposal.component.html',
  styleUrls: ['./pfrs-proposal.component.scss'],
})
export class PfrsProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNoiSteps.Proposal;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  DOCUMENT = DOCUMENT_TYPE;

  allowMiningUploads = false;
  requiresNoticeOfWork = false;
  showProposalMapVirus = false;
  showCrossSectionVirus = false;
  showReclamationPlanVirus = false;
  showNoticeOfWorkVirus = false;

  proposalMap: NoticeOfIntentDocumentDto[] = [];
  crossSections: NoticeOfIntentDocumentDto[] = [];
  reclamationPlan: NoticeOfIntentDocumentDto[] = [];
  noticeOfWork: NoticeOfIntentDocumentDto[] = [];

  isFollowUp = new FormControl<string | null>(null, [Validators.required]);
  followUpIds = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  soilTypeRemoved = new FormControl<string | null>(null, [Validators.required]);
  fillTypeToPlace = new FormControl<string | null>(null, [Validators.required]);
  projectDurationAmount = new FormControl<string | null>(null, [Validators.required]);
  projectDurationUnit = new FormControl<string | null>(null, [Validators.required]);
  areComponentsDirty = false;
  isAreaWideFilling = new FormControl<string | null>(null, [Validators.required]);
  isExtractionOrMining = new FormControl<string | null>(null, [Validators.required]);
  hasSubmittedNotice = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    isFollowUp: this.isFollowUp,
    followUpIds: this.followUpIds,
    purpose: this.purpose,
    soilTypeRemoved: this.soilTypeRemoved,
    fillTypeToPlace: this.fillTypeToPlace,
    projectDurationAmount: this.projectDurationAmount,
    projectDurationUnit: this.projectDurationUnit,
    isAreaWideFilling: this.isAreaWideFilling,
    isExtractionOrMining: this.isExtractionOrMining,
    hasSubmittedNotice: this.hasSubmittedNotice,
  });

  private submissionUuid = '';
  isMobile = false;
  fillToPlaceTableData: SoilTableData = {};
  fillAlreadyPlacedTableData: SoilTableData = {};
  removalTableData: SoilTableData = {};
  alreadyRemovedTableData: SoilTableData = {};

  constructor(
    private router: Router,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    dialog: MatDialog,
    toastService: ToastService
  ) {
    super(noticeOfIntentDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
        this.submissionUuid = noiSubmission.uuid;

        this.fillAlreadyPlacedTableData = {
          volume: noiSubmission.soilAlreadyPlacedVolume ?? 0,
          area: noiSubmission.soilAlreadyPlacedArea ?? 0,
          averageDepth: noiSubmission.soilAlreadyPlacedAverageDepth ?? 0,
          maximumDepth: noiSubmission.soilAlreadyPlacedMaximumDepth ?? 0,
        };

        this.fillToPlaceTableData = {
          volume: noiSubmission.soilToPlaceVolume ?? undefined,
          area: noiSubmission.soilToPlaceArea ?? undefined,
          averageDepth: noiSubmission.soilToPlaceAverageDepth ?? undefined,
          maximumDepth: noiSubmission.soilToPlaceMaximumDepth ?? undefined,
        };

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
        this.allowMiningUploads = !!noiSubmission.soilIsAreaWideFilling;

        this.form.patchValue({
          isFollowUp: formatBooleanToString(noiSubmission.soilIsFollowUp),
          followUpIds: noiSubmission.soilFollowUpIDs,
          purpose: noiSubmission.purpose,
          soilTypeRemoved: noiSubmission.soilTypeRemoved,
          fillTypeToPlace: noiSubmission.soilFillTypeToPlace,
          projectDurationAmount: noiSubmission.soilProjectDurationAmount?.toString() ?? null,
          projectDurationUnit: noiSubmission.soilProjectDurationUnit,
          isAreaWideFilling: formatBooleanToString(noiSubmission.soilIsAreaWideFilling),
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

  async attachNoticeOfWork(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.NOTICE_OF_WORK);
    this.showNoticeOfWorkVirus = !res;
  }

  protected async save() {
    if (this.fileId && (this.form.dirty || this.areComponentsDirty)) {
      const isNOIFollowUp = this.isFollowUp.value;
      const soilFollowUpIDs = this.followUpIds.value;
      const purpose = this.purpose.value;
      const soilFillTypeToPlace = this.fillTypeToPlace.value;
      const soilTypeRemoved = this.soilTypeRemoved.value;
      const isAreaWideFilling = this.isAreaWideFilling.value;
      const isExtractionOrMining = this.isExtractionOrMining.value;
      const hasSubmittedNotice = this.hasSubmittedNotice.value;

      const updateDto: NoticeOfIntentSubmissionUpdateDto = {
        purpose,
        soilTypeRemoved,
        soilFillTypeToPlace,
        soilIsFollowUp: parseStringToBoolean(isNOIFollowUp),
        soilFollowUpIDs,
        soilToPlaceVolume: this.fillToPlaceTableData?.volume ?? null,
        soilToPlaceArea: this.fillToPlaceTableData?.area ?? null,
        soilToPlaceMaximumDepth: this.fillToPlaceTableData?.maximumDepth ?? null,
        soilToPlaceAverageDepth: this.fillToPlaceTableData?.averageDepth ?? null,
        soilAlreadyPlacedVolume: this.fillAlreadyPlacedTableData?.volume ?? null,
        soilAlreadyPlacedArea: this.fillAlreadyPlacedTableData?.area ?? null,
        soilAlreadyPlacedMaximumDepth: this.fillAlreadyPlacedTableData?.maximumDepth ?? null,
        soilAlreadyPlacedAverageDepth: this.fillAlreadyPlacedTableData?.averageDepth ?? null,
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
        soilIsAreaWideFilling: parseStringToBoolean(isAreaWideFilling),
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

  onChangeIsAreaWideFilling(selectedValue: string) {
    this.allowMiningUploads = selectedValue === 'true' || this.isExtractionOrMining.value === 'true';
  }

  onChangeIsExtractionOrMining(selectedValue: string) {
    this.allowMiningUploads = selectedValue === 'true' || this.isAreaWideFilling.value === 'true';
    if (selectedValue === 'true') {
      this.hasSubmittedNotice.enable();
    } else {
      this.hasSubmittedNotice.setValue(null);
      this.hasSubmittedNotice.disable();
    }
  }

  onChangeNoticeOfWork(selectedValue: string) {
    this.requiresNoticeOfWork = selectedValue === 'true';
  }

  markDirty() {
    this.areComponentsDirty = true;
  }
}

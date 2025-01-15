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
import { HttpErrorResponse } from '@angular/common/http';

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
  showProposalMapHasVirusError = false;
  showProposalMapVirusScanFailedError = false;
  showCrossSectionHasVirusError = false;
  showCrossSectionVirusScanFailedError = false;
  showReclamationPlanHasVirusError = false;
  showReclamationPlanVirusScanFailedError = false;
  showNoticeOfWorkHasVirusError = false;
  showNoticeOfWorkVirusScanFailedError = false;

  proposalMap: NoticeOfIntentDocumentDto[] = [];
  crossSections: NoticeOfIntentDocumentDto[] = [];
  reclamationPlan: NoticeOfIntentDocumentDto[] = [];
  noticeOfWork: NoticeOfIntentDocumentDto[] = [];

  isFollowUp = new FormControl<string | null>(null, [Validators.required]);
  followUpIds = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  soilTypeRemoved = new FormControl<string | null>(null, [Validators.required]);
  fillTypeToPlace = new FormControl<string | null>(null, [Validators.required]);
  soilProjectDuration = new FormControl<string | null>(null, [Validators.required]);
  fillProjectDuration = new FormControl<string | null>(null, [Validators.required]);
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
    soilProjectDuration: this.soilProjectDuration,
    fillProjectDuration: this.fillProjectDuration,
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
    toastService: ToastService,
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

        this.allowMiningUploads = !!noiSubmission.soilIsAreaWideFilling || !!noiSubmission.soilIsExtractionOrMining;
        if (noiSubmission.soilIsExtractionOrMining) {
          this.hasSubmittedNotice.enable();
        } else {
          this.hasSubmittedNotice.disable();
        }

        this.requiresNoticeOfWork = !!noiSubmission.soilHasSubmittedNotice;

        this.form.patchValue({
          isFollowUp: formatBooleanToString(noiSubmission.soilIsFollowUp),
          followUpIds: noiSubmission.soilFollowUpIDs,
          purpose: noiSubmission.purpose,
          soilTypeRemoved: noiSubmission.soilTypeRemoved,
          fillTypeToPlace: noiSubmission.soilFillTypeToPlace,
          soilProjectDuration: noiSubmission.soilProjectDuration?.toString() ?? null,
          fillProjectDuration: noiSubmission.fillProjectDuration?.toString() ?? null,
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
    try {
      await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
      this.showProposalMapHasVirusError = false;
      this.showProposalMapVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showProposalMapHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showProposalMapVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  async attachCrossSection(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.CROSS_SECTIONS);
      this.showCrossSectionHasVirusError = false;
      this.showCrossSectionVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showCrossSectionHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showCrossSectionVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  async attachReclamationPlan(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.RECLAMATION_PLAN);
      this.showReclamationPlanHasVirusError = false;
      this.showReclamationPlanVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showReclamationPlanHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showReclamationPlanVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
  }

  async attachNoticeOfWork(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.NOTICE_OF_WORK);
      this.showNoticeOfWorkHasVirusError = false;
      this.showNoticeOfWorkVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showNoticeOfWorkHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showNoticeOfWorkVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
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
        soilProjectDuration: this.soilProjectDuration.value ?? null,
        fillProjectDuration: this.fillProjectDuration.value ?? null,
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
      this.requiresNoticeOfWork = false;
    }
  }

  onChangeNoticeOfWork(selectedValue: string) {
    this.requiresNoticeOfWork = selectedValue === 'true';
  }

  markDirty() {
    this.areComponentsDirty = true;
  }
}

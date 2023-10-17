import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';

@Component({
  selector: 'app-pfrs-proposal',
  templateUrl: './pfrs-proposal.component.html',
  styleUrls: ['./pfrs-proposal.component.scss'],
})
export class PfrsProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  DOCUMENT = DOCUMENT_TYPE;

  proposalMap: ApplicationDocumentDto[] = [];
  crossSections: ApplicationDocumentDto[] = [];
  reclamationPlan: ApplicationDocumentDto[] = [];
  noticeOfWork: ApplicationDocumentDto[] = [];
  areComponentsDirty = false;

  showProposalMapVirus = false;
  showCrossSectionVirus = false;
  showReclamationPlanVirus = false;
  showNoticeOfWorkVirus = false;

  isFollowUp = new FormControl<string | null>(null, [Validators.required]);
  followUpIDs = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  soilTypeRemoved = new FormControl<string | null>(null, [Validators.required]);
  reduceNegativeImpacts = new FormControl<string | null>(null, [Validators.required]);
  projectDurationAmount = new FormControl<string | null>(null, [Validators.required]);
  projectDurationUnit = new FormControl<string | null>(null, [Validators.required]);
  fillTypeToPlace = new FormControl<string | null>(null, [Validators.required]);
  alternativeMeasures = new FormControl<string | null>(null, [Validators.required]);
  isExtractionOrMining = new FormControl<string | null>(null, [Validators.required]);
  hasSubmittedNotice = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);

  form = new FormGroup({
    isFollowUp: this.isFollowUp,
    followUpIDs: this.followUpIDs,
    purpose: this.purpose,
    soilTypeRemoved: this.soilTypeRemoved,
    reduceNegativeImpacts: this.reduceNegativeImpacts,
    projectDurationAmount: this.projectDurationAmount,
    projectDurationUnit: this.projectDurationUnit,
    fillTypeToPlace: this.fillTypeToPlace,
    alternativeMeasures: this.alternativeMeasures,
    isExtractionOrMining: this.isExtractionOrMining,
    hasSubmittedNotice: this.hasSubmittedNotice,
  });

  private submissionUuid = '';
  isMobile = false;
  removalTableData: SoilTableData = {};
  alreadyRemovedTableData: SoilTableData = {};
  fillTableData: SoilTableData = {};
  alreadyFilledTableData: SoilTableData = {};
  requiresNoticeOfWork = false;

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
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

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

        if (applicationSubmission.soilIsFollowUp) {
          this.followUpIDs.enable();
        }

        if (applicationSubmission.soilIsExtractionOrMining) {
          this.hasSubmittedNotice.enable();
        }

        if (applicationSubmission.soilIsExtractionOrMining && applicationSubmission.soilHasSubmittedNotice) {
          this.requiresNoticeOfWork = true;
        }

        this.form.patchValue({
          isFollowUp: formatBooleanToString(applicationSubmission.soilIsFollowUp),
          followUpIDs: applicationSubmission.soilFollowUpIDs,
          purpose: applicationSubmission.purpose,
          soilTypeRemoved: applicationSubmission.soilTypeRemoved,
          reduceNegativeImpacts: applicationSubmission.soilReduceNegativeImpacts,
          alternativeMeasures: applicationSubmission.soilAlternativeMeasures,
          fillTypeToPlace: applicationSubmission.soilFillTypeToPlace,
          projectDurationAmount: applicationSubmission.soilProjectDurationAmount?.toString() ?? null,
          projectDurationUnit: applicationSubmission.soilProjectDurationUnit,
          isExtractionOrMining: formatBooleanToString(applicationSubmission.soilIsExtractionOrMining),
          hasSubmittedNotice: formatBooleanToString(applicationSubmission.soilHasSubmittedNotice),
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
      const isFollowUp = this.isFollowUp.getRawValue();
      const followUpIDs = this.followUpIDs.getRawValue();
      const purpose = this.purpose.getRawValue();
      const soilTypeRemoved = this.soilTypeRemoved.getRawValue();
      const soilReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();
      const soilFillTypeToPlace = this.fillTypeToPlace.getRawValue();
      const soilAlternativeMeasures = this.alternativeMeasures.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        purpose,
        soilTypeRemoved,
        soilFillTypeToPlace,
        soilReduceNegativeImpacts,
        soilAlternativeMeasures,
        soilIsFollowUp: parseStringToBoolean(isFollowUp),
        soilFollowUpIDs: followUpIDs,
        soilToRemoveVolume: this.removalTableData?.volume ?? null,
        soilToRemoveArea: this.removalTableData?.area ?? null,
        soilToRemoveMaximumDepth: this.removalTableData?.maximumDepth ?? null,
        soilToRemoveAverageDepth: this.removalTableData?.averageDepth ?? null,
        soilAlreadyRemovedVolume: this.alreadyRemovedTableData?.volume ?? null,
        soilAlreadyRemovedArea: this.alreadyRemovedTableData?.area ?? null,
        soilAlreadyRemovedMaximumDepth: this.alreadyRemovedTableData?.maximumDepth ?? null,
        soilAlreadyRemovedAverageDepth: this.alreadyRemovedTableData?.averageDepth ?? null,
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
        soilHasSubmittedNotice: parseStringToBoolean(this.hasSubmittedNotice.getRawValue()),
        soilIsExtractionOrMining: parseStringToBoolean(this.isExtractionOrMining.getRawValue()),
      };

      const updatedApp = await this.applicationService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onChangeIsFollowUp(selectedValue: string) {
    if (selectedValue === 'true') {
      this.followUpIDs.enable();
    } else if (selectedValue === 'false') {
      this.followUpIDs.disable();
      this.followUpIDs.setValue(null);
    }
  }

  onChangeMiningExtraction(selectedValue: string) {
    if (selectedValue === 'true') {
      this.hasSubmittedNotice.enable();
    } else if (selectedValue === 'false') {
      this.hasSubmittedNotice.disable();
      this.hasSubmittedNotice.setValue(null);
    }
  }

  onChangeNoticeOfWork(selectedValue: string) {
    this.requiresNoticeOfWork = selectedValue === 'true';
  }

  markDirty() {
    this.areComponentsDirty = true;
  }
}

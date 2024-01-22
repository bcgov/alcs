import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import { EditNoiSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';

@Component({
  selector: 'app-pofo-proposal',
  templateUrl: './pofo-proposal.component.html',
  styleUrls: ['./pofo-proposal.component.scss'],
})
export class PofoProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNoiSteps.Proposal;

  DOCUMENT = DOCUMENT_TYPE;

  allowMiningUploads = false;
  showProposalMapVirus = false;
  showCrossSectionVirus = false;
  showReclamationPlanVirus = false;

  proposalMap: NoticeOfIntentDocumentDto[] = [];
  crossSections: NoticeOfIntentDocumentDto[] = [];
  reclamationPlan: NoticeOfIntentDocumentDto[] = [];

  isFollowUp = new FormControl<string | null>(null, [Validators.required]);
  followUpIds = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  soilFillTypeToPlace = new FormControl<string | null>(null, [Validators.required]);
  projectDuration = new FormControl<string | null>(null, [Validators.required]);
  areComponentsDirty = false;
  isAreaWideFilling = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    isFollowUp: this.isFollowUp,
    followUpIds: this.followUpIds,
    purpose: this.purpose,
    soilFillTypeToPlace: this.soilFillTypeToPlace,
    projectDuration: this.projectDuration,
    isAreaWideFilling: this.isAreaWideFilling,
  });

  private submissionUuid = '';
  fillToPlaceTableData: SoilTableData = {};
  fillAlreadyPlacedTableData: SoilTableData = {};

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

        if (noiSubmission.soilIsFollowUp) {
          this.followUpIds.enable();
        }
        this.allowMiningUploads = !!noiSubmission.soilIsAreaWideFilling;

        this.form.patchValue({
          isFollowUp: formatBooleanToString(noiSubmission.soilIsFollowUp),
          followUpIds: noiSubmission.soilFollowUpIDs,
          purpose: noiSubmission.purpose,
          soilFillTypeToPlace: noiSubmission.soilFillTypeToPlace,
          projectDuration: noiSubmission.soilProjectDuration,
          isAreaWideFilling: formatBooleanToString(noiSubmission.soilIsAreaWideFilling),
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
      const soilFillTypeToPlace = this.soilFillTypeToPlace.getRawValue();
      const soilProjectDuration = this.projectDuration.getRawValue();
      const isAreaWideFilling = this.isAreaWideFilling.getRawValue();

      const updateDto: NoticeOfIntentSubmissionUpdateDto = {
        purpose,
        soilFillTypeToPlace,
        soilProjectDuration,
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
        soilIsAreaWideFilling: parseStringToBoolean(isAreaWideFilling),
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
    this.allowMiningUploads = selectedValue === 'true';
  }

  markDirty() {
    this.areComponentsDirty = true;
  }
}

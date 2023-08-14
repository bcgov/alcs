import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionService } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditNoiSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';

@Component({
  selector: 'app-roso-additional-information',
  templateUrl: './roso-additional-information.component.html',
  styleUrls: ['./roso-additional-information.component.scss'],
})
export class RosoAdditionalInformationComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNoiSteps.ExtraInfo;

  DOCUMENT = DOCUMENT_TYPE;

  private submissionUuid = '';

  confirmRemovalOfSoil = false;

  buildingPlans: NoticeOfIntentDocumentDto[] = [];

  isRemovingSoilForNewStructure = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    isRemovingSoilForNewStructure: this.isRemovingSoilForNewStructure,
  });

  constructor(
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

        // if (noiSubmission.soilIsFollowUp) {
        //   this.followUpIds.enable();
        // }

        if (noiSubmission.soilIsRemovingSoilForNewStructure) {
          this.confirmRemovalOfSoil = true;
        }

        this.form.patchValue({
          isRemovingSoilForNewStructure: formatBooleanToString(noiSubmission.soilIsRemovingSoilForNewStructure),
          // followUpIds: noiSubmission.soilFollowUpIDs,
          // purpose: noiSubmission.purpose,
          // soilTypeRemoved: noiSubmission.soilTypeRemoved,
          // projectDurationAmount: noiSubmission.soilProjectDurationAmount?.toString() ?? null,
          // projectDurationUnit: noiSubmission.soilProjectDurationUnit,
          // isExtractionOrMining: formatBooleanToString(noiSubmission.soilIsExtractionOrMining),
          // hasSubmittedNotice: formatBooleanToString(noiSubmission.soilHasSubmittedNotice),
        });
        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$noiDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
    });
  }

  async onSave() {
    await this.save();
  }

  protected save(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  onChangeIsRemovingSoilForNewStructure(selectedValue: string) {
    this.confirmRemovalOfSoil = parseStringToBoolean(selectedValue) ?? false;
  }
}

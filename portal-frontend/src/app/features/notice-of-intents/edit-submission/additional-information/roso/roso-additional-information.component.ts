import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionUpdateDto } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
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
  soilStructureFarmUseReason = new FormControl<string | null>(null);
  soilStructureResidentialUseReason = new FormControl<string | null>(null);
  soilAgriParcelActivity = new FormControl<string | null>(null);
  soilStructureResidentialAccessoryUseReason = new FormControl<string | null>(null);

  form = new FormGroup({
    isRemovingSoilForNewStructure: this.isRemovingSoilForNewStructure,
    soilStructureFarmUseReason: this.soilStructureFarmUseReason,
    soilStructureResidentialUseReason: this.soilStructureResidentialUseReason,
    soilAgriParcelActivity: this.soilAgriParcelActivity,
    soilStructureResidentialAccessoryUseReason: this.soilStructureResidentialAccessoryUseReason,
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

        // TODO check the structures and set corresponding validators on soil fields

        this.form.patchValue({
          isRemovingSoilForNewStructure: formatBooleanToString(noiSubmission.soilIsRemovingSoilForNewStructure),
          soilStructureFarmUseReason: noiSubmission.soilStructureFarmUseReason,
          soilStructureResidentialUseReason: noiSubmission.soilStructureResidentialUseReason,
          soilAgriParcelActivity: noiSubmission.soilAgriParcelActivity,
          soilStructureResidentialAccessoryUseReason: noiSubmission.soilStructureResidentialAccessoryUseReason,
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

  protected async save(): Promise<void> {
    console.log('here')
    if (this.fileId && this.form.dirty) {
      const isRemovingSoilForNewStructure = this.isRemovingSoilForNewStructure.getRawValue();
      const soilStructureFarmUseReason = this.soilStructureFarmUseReason.getRawValue();
      const soilStructureResidentialUseReason = this.soilStructureResidentialUseReason.getRawValue();
      const soilAgriParcelActivity = this.soilAgriParcelActivity.getRawValue();
      const soilStructureResidentialAccessoryUseReason = this.soilStructureResidentialAccessoryUseReason.getRawValue();

      const updateDto: NoticeOfIntentSubmissionUpdateDto = {
        soilStructureFarmUseReason,
        soilStructureResidentialUseReason,
        soilIsRemovingSoilForNewStructure: parseStringToBoolean(isRemovingSoilForNewStructure),
        soilAgriParcelActivity,
        soilStructureResidentialAccessoryUseReason,
      };

      const updatedApp = await this.noticeOfIntentSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$noiSubmission.next(updatedApp);
    }
  }

  onChangeIsRemovingSoilForNewStructure(selectedValue: string) {
    this.confirmRemovalOfSoil = parseStringToBoolean(selectedValue) ?? false;
  }
}

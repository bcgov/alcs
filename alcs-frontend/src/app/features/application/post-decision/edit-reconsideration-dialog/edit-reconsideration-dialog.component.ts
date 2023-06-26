import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ApplicationReconsiderationDetailedDto,
  RECONSIDERATION_TYPE,
  UpdateApplicationReconsiderationDto,
} from '../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { APPLICATION_SYSTEM_SOURCE_TYPES } from '../../../../services/application/application.dto';
import { ApplicationDecisionService } from '../../../../services/application/decision/application-decision-v1/application-decision.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { BaseCodeDto } from '../../../../shared/dto/base.dto';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';
import { parseBooleanToString, parseStringToBoolean } from '../../../../shared/utils/boolean-helper';

@Component({
  selector: 'app-edit-reconsideration-dialog',
  templateUrl: './edit-reconsideration-dialog.component.html',
  styleUrls: ['./edit-reconsideration-dialog.component.scss'],
})
export class EditReconsiderationDialogComponent implements OnInit {
  isLoading = false;
  codes: BaseCodeDto[] = [];
  isOriginatedInPortal: boolean = false;

  typeControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  reviewOutcomeCodeControl = new FormControl<string | null>(null);

  // for application originated in portal
  descriptionControl = new FormControl<string | null>('', [Validators.required]);
  isNewProposalControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  isIncorrectFalseInfoControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  isNewEvidenceControl = new FormControl<string | undefined>(undefined, [Validators.required]);

  form: FormGroup = new FormGroup({
    submittedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
    type: this.typeControl,
    reviewOutcomeCode: this.reviewOutcomeCodeControl,
    reviewDate: new FormControl<Date | null | undefined>(null),
    reconsidersDecisions: new FormControl<string[]>([], [Validators.required]),
  });
  decisions: { uuid: string; resolution: string }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileNumber: string;
      existingRecon: ApplicationReconsiderationDetailedDto;
      codes: BaseCodeDto[];
    },
    private dialogRef: MatDialogRef<EditReconsiderationDialogComponent>,
    private reconsiderationService: ApplicationReconsiderationService,
    private decisionService: ApplicationDecisionService,
    private toastService: ToastService
  ) {
    this.codes = data.codes;
    this.isOriginatedInPortal = data.existingRecon.application.source === APPLICATION_SYSTEM_SOURCE_TYPES.APPLICANT;

    this.form.patchValue({
      submittedDate: new Date(data.existingRecon.submittedDate),
      type: data.existingRecon.type.code,
      reviewOutcomeCode:
        data.existingRecon.type.code === RECONSIDERATION_TYPE.T_33
          ? data.existingRecon.reviewOutcome?.code || 'PEN'
          : null,
      reviewDate: data.existingRecon.reviewDate ? new Date(data.existingRecon.reviewDate) : null,
      reconsidersDecisions: data.existingRecon.reconsideredDecisions.map((dec) => dec.uuid),
    });

    if (this.isOriginatedInPortal) {
      this.form.addControl('description', this.descriptionControl);
      this.form.addControl('isNewProposal', this.isNewProposalControl);
      this.form.addControl('isIncorrectFalseInfo', this.isIncorrectFalseInfoControl);
      this.form.addControl('isNewEvidence', this.isNewEvidenceControl);

      this.descriptionControl.patchValue(data.existingRecon.description ?? null);
      this.isNewProposalControl.patchValue(parseBooleanToString(data.existingRecon.isNewProposal));
      this.isIncorrectFalseInfoControl.patchValue(parseBooleanToString(data.existingRecon.isIncorrectFalseInfo));
      this.isNewEvidenceControl.patchValue(parseBooleanToString(data.existingRecon.isNewEvidence));
    }
  }

  ngOnInit(): void {
    this.loadDecisions(this.data.fileNumber);
  }

  async onSubmit() {
    this.isLoading = true;

    const {
      submittedDate,
      type,
      reviewOutcomeCode,
      reviewDate,
      reconsidersDecisions,
      description,
      isNewProposal,
      isIncorrectFalseInfo,
      isNewEvidence,
    } = this.form.getRawValue();
    const data: UpdateApplicationReconsiderationDto = {
      submittedDate: formatDateForApi(submittedDate!),
      reviewOutcomeCode: reviewOutcomeCode,
      typeCode: type!,
      reviewDate: reviewDate ? formatDateForApi(reviewDate) : reviewDate,
      reconsideredDecisionUuids: reconsidersDecisions || [],
    };

    if (this.isOriginatedInPortal) {
      data.description = description;
      data.isNewProposal = parseStringToBoolean(isNewProposal);
      data.isIncorrectFalseInfo = parseStringToBoolean(isIncorrectFalseInfo);
      data.isNewEvidence = parseStringToBoolean(isNewEvidence);
    }

    try {
      await this.reconsiderationService.update(this.data.existingRecon.uuid, { ...data });
      this.toastService.showSuccessToast('Reconsideration updated');
    } finally {
      this.isLoading = false;
    }
    this.dialogRef.close(true);
  }

  async loadDecisions(fileNumber: string) {
    const decisions = await this.decisionService.fetchByApplication(fileNumber);
    if (decisions.length > 0) {
      this.decisions = decisions.map((decision) => ({
        uuid: decision.uuid,
        resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
      }));
    }
  }

  async onTypeReconsiderationChange(reconsiderationType: string) {
    if (reconsiderationType === RECONSIDERATION_TYPE.T_33_1) {
      this.form.patchValue({
        reviewOutcomeCode: null,
      });
    } else {
      this.form.patchValue({
        reviewOutcomeCode: 'PEN',
      });
    }
  }
}

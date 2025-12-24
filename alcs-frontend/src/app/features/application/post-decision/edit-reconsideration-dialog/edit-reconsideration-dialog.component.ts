import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationReconsiderationDetailedDto,
  RECONSIDERATION_TYPE,
  UpdateApplicationReconsiderationDto,
} from '../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { BaseCodeDto } from '../../../../shared/dto/base.dto';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';
import { parseBooleanToString, parseStringToBoolean } from '../../../../shared/utils/boolean-helper';

@Component({
    selector: 'app-edit-reconsideration-dialog',
    templateUrl: './edit-reconsideration-dialog.component.html',
    styleUrls: ['./edit-reconsideration-dialog.component.scss'],
    standalone: false
})
export class EditReconsiderationDialogComponent implements OnInit {
  isLoading = false;
  codes: BaseCodeDto[] = [];

  typeControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  reviewOutcomeCodeControl = new FormControl<string | null>(null);
  decisionOutcomeCodeControl = new FormControl<string | null>(null);
  reviewDateControl = new FormControl<Date | null | undefined>(null);
  isNewProposalControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  isIncorrectFalseInfoControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  isNewEvidenceControl = new FormControl<string | undefined>(undefined, [Validators.required]);

  disable331Fields = false;

  form: FormGroup = new FormGroup({
    submittedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
    type: this.typeControl,
    reviewOutcomeCode: this.reviewOutcomeCodeControl,
    decisionOutcomeCode: this.decisionOutcomeCodeControl,
    reviewDate: this.reviewDateControl,
    reconsidersDecisions: new FormControl<string[]>([], [Validators.required]),
    description: new FormControl<string | null>('', [Validators.required]),
    isNewProposal: this.isNewProposalControl,
    isIncorrectFalseInfo: this.isIncorrectFalseInfoControl,
    isNewEvidence: this.isNewEvidenceControl,
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
    private decisionService: ApplicationDecisionV2Service,
    private toastService: ToastService,
  ) {
    this.codes = data.codes;

    this.form.patchValue({
      submittedDate: new Date(data.existingRecon.submittedDate),
      type: data.existingRecon.type.code,
      reviewOutcomeCode:
        data.existingRecon.type.code === RECONSIDERATION_TYPE.T_33
          ? data.existingRecon.reviewOutcome?.code || 'PEN'
          : null,
      decisionOutcomeCode: data.existingRecon.decisionOutcome?.code,
      reviewDate: data.existingRecon.reviewDate ? new Date(data.existingRecon.reviewDate) : null,
      reconsidersDecisions: data.existingRecon.reconsidersDecisions.map((dec) => dec.uuid),
      description: data.existingRecon.description ?? null,
      isNewProposal: parseBooleanToString(data.existingRecon.isNewProposal),
      isIncorrectFalseInfo: parseBooleanToString(data.existingRecon.isIncorrectFalseInfo),
      isNewEvidence: parseBooleanToString(data.existingRecon.isNewEvidence),
    });
    this.handleReconType(data.existingRecon.type.code === RECONSIDERATION_TYPE.T_33);
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
      decisionOutcomeCode,
    } = this.form.getRawValue();
    const data: UpdateApplicationReconsiderationDto = {
      submittedDate: formatDateForApi(submittedDate!),
      reviewOutcomeCode: this.disable331Fields ? 'PRC' : reviewOutcomeCode,
      decisionOutcomeCode: decisionOutcomeCode,
      typeCode: type!,
      reviewDate: reviewDate ? formatDateForApi(reviewDate) : reviewDate,
      reconsideredDecisionUuids: reconsidersDecisions || [],
      description: description,
      isNewProposal: parseStringToBoolean(isNewProposal),
      isIncorrectFalseInfo: parseStringToBoolean(isIncorrectFalseInfo),
      isNewEvidence: parseStringToBoolean(isNewEvidence),
    };

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
      this.decisions = decisions
        .filter((e) => !e.isDraft)
        .map((decision) => ({
          uuid: decision.uuid,
          resolution: `#${decision.resolutionNumber}/${decision.resolutionYear}`,
        }));
    }
  }

  async onTypeReconsiderationChange(reconsiderationType: string) {
    if (reconsiderationType === RECONSIDERATION_TYPE.T_33_1) {
      this.reviewOutcomeCodeControl.setValue(null);
      this.handleReconType(false);
    } else {
      this.reviewOutcomeCodeControl.setValue('PEN');
      this.handleReconType(true);
    }
  }

  onChangeReviewOutcome() {
    //Clear fields that only show up sometimes
    this.decisionOutcomeCodeControl.setValue(null);
    this.reviewDateControl.setValue(null);
  }

  private handleReconType(enable: boolean) {
    if (enable) {
      this.isNewEvidenceControl.enable();
      this.isIncorrectFalseInfoControl.enable();
      this.isNewProposalControl.enable();
      this.reviewOutcomeCodeControl.enable();
      this.disable331Fields = false;
    } else {
      this.isNewEvidenceControl.disable();
      this.isNewEvidenceControl.setValue(null);
      this.isIncorrectFalseInfoControl.disable();
      this.isIncorrectFalseInfoControl.setValue(null);
      this.isNewProposalControl.disable();
      this.isNewProposalControl.setValue(null);
      this.reviewOutcomeCodeControl.disable();
      this.reviewOutcomeCodeControl.setValue(null);
      this.disable331Fields = true;
    }
  }
}

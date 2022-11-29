import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationDecisionService } from '../../../../services/application/application-decision/application-decision.service';
import {
  ApplicationReconsiderationDetailedDto,
  UpdateApplicationReconsiderationDto,
} from '../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { BaseCodeDto } from '../../../../shared/dto/base.dto';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-edit-reconsideration-dialog',
  templateUrl: './edit-reconsideration-dialog.component.html',
  styleUrls: ['./edit-reconsideration-dialog.component.scss'],
})
export class EditReconsiderationDialogComponent implements OnInit {
  isLoading = false;
  codes: BaseCodeDto[] = [];

  typeControl = new FormControl<string | undefined>(undefined, [Validators.required]);
  reviewOutcomeCodeControl = new FormControl<string | null>(null);

  form = new FormGroup({
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
      existingDecision: ApplicationReconsiderationDetailedDto;
      codes: BaseCodeDto[];
    },
    private dialogRef: MatDialogRef<EditReconsiderationDialogComponent>,
    private reconsiderationService: ApplicationReconsiderationService,
    private decisionService: ApplicationDecisionService,
    private toastService: ToastService
  ) {
    this.codes = data.codes;
    this.form.patchValue({
      submittedDate: new Date(data.existingDecision.submittedDate),
      type: data.existingDecision.type.code,
      reviewOutcomeCode: data.existingDecision.reviewOutcome?.code,
      reviewDate: data.existingDecision.reviewDate ? new Date(data.existingDecision.reviewDate) : null,
      reconsidersDecisions: data.existingDecision.reconsideredDecisions.map((dec) => dec.uuid),
    });
  }

  ngOnInit(): void {
    this.loadDecisions(this.data.fileNumber);
  }

  async onSubmit() {
    this.isLoading = true;

    const { submittedDate, type, reviewOutcomeCode, reviewDate, reconsidersDecisions } = this.form.getRawValue();
    const data: UpdateApplicationReconsiderationDto = {
      submittedDate: formatDateForApi(submittedDate!),
      reviewOutcomeCode: reviewOutcomeCode,
      typeCode: type!,
      reviewDate: reviewDate ? formatDateForApi(reviewDate) : reviewDate,
      reconsideredDecisionUuids: reconsidersDecisions || [],
    };

    try {
      await this.reconsiderationService.update(this.data.existingDecision.uuid, { ...data });
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
}

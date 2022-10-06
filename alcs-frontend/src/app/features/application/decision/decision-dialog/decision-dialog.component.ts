import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutcomeTypeDto,
} from '../../../../services/application/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../../services/application/application-decision/application-decision.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-decision-dialog',
  templateUrl: './decision-dialog.component.html',
  styleUrls: ['./decision-dialog.component.scss'],
})
export class DecisionDialogComponent {
  isLoading = false;
  isEdit = false;
  minDate = new Date(0);

  form = new FormGroup({
    outcome: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    chairReviewRequired: new FormControl<string>('true', [Validators.required]),
    auditDate: new FormControl<Date | null>(null),
    chairReviewDate: new FormControl<Date | null>(null),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileNumber: string;
      codes: ApplicationDecisionOutcomeTypeDto[];
      existingDecision?: ApplicationDecisionDto;
      minDate?: Date;
    },
    private dialogRef: MatDialogRef<DecisionDialogComponent>,
    private decisionService: ApplicationDecisionService
  ) {
    if (data.minDate) {
      this.minDate = data.minDate;
    }
    if (data.existingDecision) {
      this.isEdit = true;
      this.form.patchValue({
        outcome: data.existingDecision.outcome,
        date: new Date(data.existingDecision.date),
        chairReviewRequired: data.existingDecision.chairReviewRequired ? 'true' : 'false',
        chairReviewDate: data.existingDecision.chairReviewDate
          ? new Date(data.existingDecision.chairReviewDate)
          : undefined,
        auditDate: data.existingDecision.auditDate ? new Date(data.existingDecision.auditDate) : undefined,
      });
    }
  }

  async onSubmit() {
    this.isLoading = true;
    const { date, outcome, chairReviewRequired, auditDate, chairReviewDate } = this.form.getRawValue();
    const data = {
      date: date!.getTime(),
      outcome: outcome!,
      chairReviewRequired: chairReviewRequired === 'true',
      auditDate: auditDate ? formatDateForApi(auditDate) : auditDate,
      chairReviewDate: chairReviewDate ? formatDateForApi(chairReviewDate) : chairReviewDate,
    };
    try {
      if (this.data.existingDecision) {
        await this.decisionService.update(this.data.existingDecision.uuid, data);
      } else {
        await this.decisionService.create({
          ...data,
          applicationFileNumber: this.data.fileNumber,
        });
      }
    } finally {
      this.isLoading = false;
    }
    this.dialogRef.close(true);
  }
}

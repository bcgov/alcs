import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutcomeDto,
} from '../../../../services/application/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../../services/application/application-decision/application-decision.service';

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
    startDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileNumber: string;
      codes: ApplicationDecisionOutcomeDto[];
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
        startDate: new Date(data.existingDecision.date),
      });
    }
  }

  async onSubmit() {
    this.isLoading = true;
    const { startDate, outcome } = this.form.getRawValue();

    try {
      if (this.data.existingDecision) {
        await this.decisionService.update(this.data.existingDecision.uuid, {
          date: startDate!.getTime(),
          outcome: outcome!,
        });
      } else {
        await this.decisionService.create({
          date: startDate!.getTime(),
          outcome: outcome!,
          applicationFileNumber: this.data.fileNumber,
        });
      }
    } finally {
      this.isLoading = false;
    }
    this.dialogRef.close(true);
  }
}

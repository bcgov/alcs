import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutcomeTypeDto,
  CeoCriterionDto,
  CreateApplicationDecisionDto,
  DecisionMakerDto,
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
    decisionMaker: new FormControl<string | null>(null, [Validators.required]),
    ceoCriterion: new FormControl<string | null>(null),
    chairReviewRequired: new FormControl<string>('true', [Validators.required]),
    chairReviewDate: new FormControl<Date | null>(null),
    chairReviewOutcome: new FormControl<string | null>(null),
    auditDate: new FormControl<Date | null>(null),
    isTimeExtension: new FormControl<string | null>(null),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileNumber: string;
      outcomes: ApplicationDecisionOutcomeTypeDto[];
      decisionMakers: DecisionMakerDto[];
      ceoCriterion: CeoCriterionDto[];
      existingDecision?: ApplicationDecisionDto;
      minDate?: Date;
      isTimeExtension?: boolean;
    },
    private dialogRef: MatDialogRef<DecisionDialogComponent>,
    private decisionService: ApplicationDecisionService
  ) {
    if (data.minDate) {
      this.minDate = data.minDate;
    }

    this.form.controls['decisionMaker']!.valueChanges.subscribe((val) => {
      if (val === 'CEOP') {
        this.form.controls['ceoCriterion'].setValidators([Validators.required]);
      } else {
        this.form.controls['ceoCriterion'].clearValidators();
      }
      this.form.controls['ceoCriterion'].updateValueAndValidity();
    });

    if (data.existingDecision) {
      this.isEdit = true;
      this.form.patchValue({
        outcome: data.existingDecision.outcome.code,
        decisionMaker: data.existingDecision.decisionMaker?.code,
        ceoCriterion: data.existingDecision.ceoCriterion?.code,
        date: new Date(data.existingDecision.date),
        chairReviewRequired: data.existingDecision.chairReviewRequired ? 'true' : 'false',
        chairReviewDate: data.existingDecision.chairReviewDate
          ? new Date(data.existingDecision.chairReviewDate)
          : undefined,
        auditDate: data.existingDecision.auditDate ? new Date(data.existingDecision.auditDate) : undefined,
      });
      if (data.existingDecision.isTimeExtension !== null) {
        this.form.patchValue({
          isTimeExtension: data.existingDecision.isTimeExtension ? 'true' : 'false',
        });
      }
      if (data.existingDecision.chairReviewOutcome !== null) {
        this.form.patchValue({
          chairReviewOutcome: data.existingDecision.chairReviewOutcome ? 'true' : 'false',
        });
      }
    }
  }

  async onSubmit() {
    this.isLoading = true;
    const {
      date,
      outcome,
      decisionMaker,
      ceoCriterion,
      isTimeExtension,
      chairReviewRequired,
      auditDate,
      chairReviewDate,
      chairReviewOutcome,
    } = this.form.getRawValue();
    const data: CreateApplicationDecisionDto = {
      date: date!.getTime(),
      chairReviewRequired: chairReviewRequired === 'true',
      auditDate: auditDate ? formatDateForApi(auditDate) : auditDate,
      chairReviewDate: chairReviewDate ? formatDateForApi(chairReviewDate) : chairReviewDate,
      outcomeCode: outcome!,
      decisionMakerCode: decisionMaker,
      ceoCriterionCode: ceoCriterion,
      isTimeExtension: null,
      applicationFileNumber: this.data.fileNumber,
    };
    if (ceoCriterion && ceoCriterion === 'MODI' && isTimeExtension !== null) {
      data.isTimeExtension = isTimeExtension === 'true';
    }
    if (chairReviewOutcome !== null) {
      data.chairReviewOutcome = chairReviewOutcome === 'true';
    }

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

  onSelectDecisionMaker(decisionMaker: DecisionMakerDto) {
    if (decisionMaker.code !== 'CEOP') {
      this.form.patchValue({
        ceoCriterion: null,
      });
    }
  }

  onSelectChairReviewRequired($event: MatButtonToggleChange) {
    if ($event.value === 'false') {
      this.form.patchValue({
        chairReviewOutcome: null,
        chairReviewDate: null,
      });
    }
  }
}

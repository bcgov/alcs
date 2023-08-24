import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import {
  CreateNoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeCodeDto,
} from '../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionService } from '../../../../services/notice-of-intent/decision/notice-of-intent-decision.service';
import { NoticeOfIntentModificationDto } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';

export enum PostDecisionType {
  Modification = 'modification',
  Reconsideration = 'reconsideration',
}

type MappedPostDecision = {
  label: string;
  uuid: string;
  type: PostDecisionType;
};

@Component({
  selector: 'app-notice-of-intent-decision-dialog',
  templateUrl: './decision-dialog.component.html',
  styleUrls: ['./decision-dialog.component.scss'],
})
export class DecisionDialogComponent implements OnInit {
  isLoading = false;
  isEdit = false;
  minDate = new Date(0);

  postDecisions: MappedPostDecision[] = [];
  outcomes: NoticeOfIntentDecisionOutcomeCodeDto[] = [];

  resolutionYears: number[] = [];

  form = new FormGroup({
    outcome: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    decisionMaker: new FormControl<string | null>('CEO Delegate', [Validators.required]),
    decisionMakerName: new FormControl<string | null>(null, []),
    postDecision: new FormControl<string | null>({ disabled: true, value: null }),
    resolutionNumber: new FormControl<string | null>(null, [Validators.required]),
    resolutionYear: new FormControl<number | null>(null, [Validators.required]),
    auditDate: new FormControl<Date | null>(null),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      isFirstDecision: boolean;
      fileNumber: string;
      outcomes: NoticeOfIntentDecisionOutcomeCodeDto[];
      minDate?: Date;
      existingDecision?: NoticeOfIntentDecisionDto;
    },
    private dialogRef: MatDialogRef<DecisionDialogComponent>,
    private decisionService: NoticeOfIntentDecisionService,
    private noticeOfIntentModificationService: NoticeOfIntentModificationService
  ) {
    if (data.minDate) {
      this.minDate = data.minDate;
    }

    if (!data.isFirstDecision) {
      this.form.controls.postDecision.enable();
      this.form.controls.postDecision.setValidators([Validators.required]);
      this.loadModifications();

      this.noticeOfIntentModificationService.$modifications.subscribe((modifications) => {
        this.mapModifications(modifications, data.existingDecision);
      });
    }

    this.outcomes = data.outcomes;
    if (data.existingDecision) {
      this.patchFormWithExistingData(data.existingDecision);
    }
  }

  ngOnInit(): void {
    const year = moment('1974');
    const currentYear = moment().year();
    while (year.year() <= currentYear) {
      this.resolutionYears.push(year.year());
      year.add(1, 'year');
    }
    this.resolutionYears.reverse();
    if (!this.isEdit) {
      this.form.patchValue({
        resolutionYear: currentYear,
      });
    }
  }

  async onSubmit() {
    this.isLoading = true;
    const {
      date,
      outcome,
      decisionMaker,
      decisionMakerName,
      resolutionNumber,
      resolutionYear,
      auditDate,
      postDecision,
    } = this.form.getRawValue();

    const data: CreateNoticeOfIntentDecisionDto = {
      date: formatDateForApi(date!),
      resolutionNumber: parseInt(resolutionNumber!),
      resolutionYear: resolutionYear!,
      auditDate: auditDate ? formatDateForApi(auditDate) : auditDate,
      outcomeCode: outcome!,
      decisionMaker: decisionMaker!,
      decisionMakerName: decisionMakerName!,
      fileNumber: this.data.fileNumber,
      modifiesUuid: postDecision ?? undefined,
      isDraft: false,
    };

    try {
      if (this.data.existingDecision) {
        await this.decisionService.update(this.data.existingDecision.uuid, data);
      } else {
        await this.decisionService.create(data);
      }
      this.dialogRef.close(true);
    } finally {
      this.isLoading = false;
    }
  }

  private patchFormWithExistingData(existingDecision: NoticeOfIntentDecisionDto) {
    this.isEdit = true;
    this.form.patchValue({
      outcome: existingDecision.outcome.code,
      decisionMaker: existingDecision.decisionMaker,
      decisionMakerName: existingDecision.decisionMakerName,
      date: new Date(existingDecision.date),
      resolutionYear: existingDecision.resolutionYear,
      resolutionNumber: existingDecision.resolutionNumber.toString(10),
      auditDate: existingDecision.auditDate ? new Date(existingDecision.auditDate) : undefined,
      postDecision: existingDecision.modifies?.uuid,
    });
  }

  async loadModifications() {
    await this.noticeOfIntentModificationService.fetchByFileNumber(this.data.fileNumber);
  }

  private mapModifications(
    modifications: NoticeOfIntentModificationDto[],
    existingDecision?: NoticeOfIntentDecisionDto
  ) {
    this.postDecisions = modifications
      .filter(
        (modification) =>
          (existingDecision && existingDecision.modifies?.uuid === modification.uuid) ||
          (modification.reviewOutcome.code === 'PRC' && modification.resultingDecision === null)
      )
      .map((modification, index) => ({
        label: `Modification Request #${modifications.length - index} - ${modification.modifiesDecisions
          .map((dec) => `#${dec.resolutionNumber}/${dec.resolutionYear}`)
          .join(', ')}`,
        uuid: modification.uuid,
        type: PostDecisionType.Modification,
      }));
  }
}

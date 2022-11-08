import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { combineLatestWith } from 'rxjs';
import { ApplicationAmendmentService } from '../../../../services/application/application-amendment/application-amendment.service';
import {
  ApplicationDecisionDto,
  DecisionOutcomeCodeDto,
  CeoCriterionDto,
  CreateApplicationDecisionDto,
  DecisionMakerDto,
  DecisionMaker,
  CeoCriterion,
} from '../../../../services/application/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../../services/application/application-decision/application-decision.service';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { formatDateForApi } from '../../../../shared/utils/api-date-formatter';

type MappedPostDecision = {
  label: string;
  uuid: string;
  type: string;
};

@Component({
  selector: 'app-decision-dialog',
  templateUrl: './decision-dialog.component.html',
  styleUrls: ['./decision-dialog.component.scss'],
})
export class DecisionDialogComponent implements OnInit {
  isLoading = false;
  isEdit = false;
  minDate = new Date(0);

  postDecisions: MappedPostDecision[] = [];
  ceoCriterion: CeoCriterionDto[] = [];
  outcomes: DecisionOutcomeCodeDto[] = [];

  resolutionYears: number[] = [];

  form = new FormGroup({
    outcome: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    decisionMaker: new FormControl<string | null>(null, [Validators.required]),
    postDecision: new FormControl<string | null>(null),
    resolutionNumber: new FormControl<number | null>(null, [Validators.required]),
    resolutionYear: new FormControl<number | null>(null, [Validators.required]),
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
      isFirstDecision: boolean;
      fileNumber: string;
      outcomes: DecisionOutcomeCodeDto[];
      decisionMakers: DecisionMakerDto[];
      ceoCriterion: CeoCriterionDto[];
      existingDecision?: ApplicationDecisionDto;
      minDate?: Date;
      isTimeExtension?: boolean;
    },
    private dialogRef: MatDialogRef<DecisionDialogComponent>,
    private decisionService: ApplicationDecisionService,
    private reconsiderationService: ApplicationReconsiderationService,
    private amendmentService: ApplicationAmendmentService
  ) {
    this.ceoCriterion = this.data.ceoCriterion;
    if (data.minDate) {
      this.minDate = data.minDate;
    }

    if (!data.isFirstDecision) {
      this.form.controls.postDecision.addValidators([Validators.required]);
      this.form.controls.decisionMaker.disable();
      this.form.controls.outcome.disable();
    }

    this.outcomes = data.outcomes.filter((outcome) => outcome.isFirstDecision === data.isFirstDecision);

    this.amendmentService.$amendments
      .pipe(combineLatestWith(this.reconsiderationService.$reconsiderations))
      .subscribe(([amendments, reconsiderations]) => {
        const mappedAmendments = amendments.map((amendment, index) => ({
          label: `Amendment Request #${amendments.length - index} - ${amendment.amendedDecisions
            .map((dec) => `#${dec.resolutionNumber}/${dec.resolutionYear}`)
            .join(', ')}`,
          uuid: amendment.uuid,
          type: 'amendment',
        }));

        const mappedRecons = reconsiderations.map((reconsideration, index) => ({
          label: `Reconsideration Request #${reconsiderations.length - index} - ${reconsideration.reconsideredDecisions
            .map((dec) => `#${dec.resolutionNumber}/${dec.resolutionYear}`)
            .join(', ')}`,
          uuid: reconsideration.uuid,
          type: 'reconsideration',
        }));
        this.postDecisions = [...mappedAmendments, ...mappedRecons];
      });

    if (data.existingDecision) {
      this.isEdit = true;
      this.form.patchValue({
        outcome: data.existingDecision.outcome.code,
        decisionMaker: data.existingDecision.decisionMaker?.code,
        ceoCriterion: data.existingDecision.ceoCriterion?.code,
        date: new Date(data.existingDecision.date),
        resolutionYear: data.existingDecision.resolutionYear,
        resolutionNumber: data.existingDecision.resolutionNumber,
        chairReviewRequired: data.existingDecision.chairReviewRequired ? 'true' : 'false',
        chairReviewDate: data.existingDecision.chairReviewDate
          ? new Date(data.existingDecision.chairReviewDate)
          : undefined,
        auditDate: data.existingDecision.auditDate ? new Date(data.existingDecision.auditDate) : undefined,
        postDecision: data.existingDecision.amends?.uuid || data.existingDecision.reconsiders?.uuid,
      });
      if (data.existingDecision.reconsiders) {
        this.onSelectPostDecision({
          type: 'reconsideration',
        });
      }
      if (data.existingDecision.amends) {
        this.onSelectPostDecision({
          type: 'amendment',
        });
      }
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

  ngOnInit(): void {
    const year = moment('1974');
    const currentYear = moment().year();
    while (year.year() <= currentYear) {
      this.resolutionYears.push(year.year());
      year.add(1, 'year');
    }
    this.resolutionYears.reverse();
    this.form.patchValue({
      resolutionYear: currentYear,
    });
  }

  async onSubmit() {
    this.isLoading = true;
    const {
      date,
      outcome,
      decisionMaker,
      resolutionNumber,
      resolutionYear,
      ceoCriterion,
      isTimeExtension,
      chairReviewRequired,
      auditDate,
      chairReviewDate,
      chairReviewOutcome,
      postDecision,
    } = this.form.getRawValue();

    const selectedDecision = this.postDecisions.find((postDec) => postDec.uuid === postDecision);
    const isPostDecisionReconsideration = selectedDecision && selectedDecision.type === 'reconsideration';

    const data: CreateApplicationDecisionDto = {
      date: date!.getTime(),
      resolutionNumber: resolutionNumber!,
      resolutionYear: resolutionYear!,
      chairReviewRequired: chairReviewRequired === 'true',
      auditDate: auditDate ? formatDateForApi(auditDate) : auditDate,
      chairReviewDate: chairReviewDate ? formatDateForApi(chairReviewDate) : chairReviewDate,
      outcomeCode: outcome!,
      decisionMakerCode: decisionMaker,
      ceoCriterionCode: ceoCriterion,
      isTimeExtension: null,
      applicationFileNumber: this.data.fileNumber,
      amendsUuid: isPostDecisionReconsideration ? null : postDecision!,
      reconsidersUuid: isPostDecisionReconsideration ? postDecision! : null,
    };
    if (ceoCriterion && ceoCriterion === CeoCriterion.MODIFICATION && isTimeExtension !== null) {
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
    if (decisionMaker.code === DecisionMaker.CEO) {
      this.form.controls['ceoCriterion'].setValidators([Validators.required]);
    } else {
      this.form.patchValue({
        ceoCriterion: null,
      });
      this.form.controls['ceoCriterion'].clearValidators();
    }
    this.form.controls['ceoCriterion'].updateValueAndValidity();
  }

  onSelectChairReviewRequired($event: MatButtonToggleChange) {
    if ($event.value === 'false') {
      this.form.patchValue({
        chairReviewOutcome: null,
        chairReviewDate: null,
      });
    }
  }

  onSelectPostDecision(postDecision: { type: string }) {
    if (postDecision.type === 'amendment') {
      this.form.controls.ceoCriterion.disable();
      this.form.controls.outcome.disable();
      this.form.controls.decisionMaker.disable();
      this.ceoCriterion = this.data.ceoCriterion.filter(
        (ceoCriterion) => ceoCriterion.code === CeoCriterion.MODIFICATION
      );
      this.form.patchValue({
        decisionMaker: DecisionMaker.CEO,
        ceoCriterion: CeoCriterion.MODIFICATION,
        outcome: 'VARY',
      });
    } else {
      this.form.controls.decisionMaker.enable();
      this.form.controls.outcome.enable();
      this.form.controls.ceoCriterion.enable();
      this.ceoCriterion = this.data.ceoCriterion.filter(
        (ceoCriterion) => ceoCriterion.code !== CeoCriterion.MODIFICATION
      );
    }
  }
}

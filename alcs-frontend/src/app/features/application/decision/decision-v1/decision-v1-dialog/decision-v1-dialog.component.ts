import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { combineLatestWith } from 'rxjs';
import {
  ApplicationDecisionDto,
  CeoCriterion,
  CeoCriterionDto,
  CreateApplicationDecisionDto,
  DecisionMaker,
  DecisionMakerDto,
  DecisionOutcomeCodeDto,
} from '../../../../../services/application/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../../../services/application/application-decision/application-decision.service';
import { ApplicationModificationDto } from '../../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../../services/application/application-reconsideration/application-reconsideration.service';
import { formatDateForApi } from '../../../../../shared/utils/api-date-formatter';

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
  selector: 'app-decision-v1-dialog',
  templateUrl: './decision-v1-dialog.component.html',
  styleUrls: ['./decision-v1-dialog.component.scss'],
})
export class DecisionV1DialogComponent implements OnInit {
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
    resolutionNumber: new FormControl<string | null>(null, [Validators.required]),
    resolutionYear: new FormControl<number | null>(null, [Validators.required]),
    ceoCriterion: new FormControl<string | null>(null),
    chairReviewRequired: new FormControl<string>('true', [Validators.required]),
    chairReviewDate: new FormControl<Date | null>(null),
    chairReviewOutcome: new FormControl<string | null>(null),
    auditDate: new FormControl<Date | null>(null),
    criterionModification: new FormControl<string[]>([]),
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
    },
    private dialogRef: MatDialogRef<DecisionV1DialogComponent>,
    private decisionService: ApplicationDecisionService,
    private reconsiderationService: ApplicationReconsiderationService,
    private modificationService: ApplicationModificationService
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

    this.modificationService.$modifications
      .pipe(combineLatestWith(this.reconsiderationService.$reconsiderations))
      .subscribe(([modifications, reconsiderations]) => {
        this.mapPostDecisionsToControls(modifications, reconsiderations, data.existingDecision);
      });

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
      resolutionNumber,
      resolutionYear,
      ceoCriterion,
      criterionModification,
      chairReviewRequired,
      auditDate,
      chairReviewDate,
      chairReviewOutcome,
      postDecision,
    } = this.form.getRawValue();

    const selectedDecision = this.postDecisions.find((postDec) => postDec.uuid === postDecision);
    const isPostDecisionReconsideration =
      selectedDecision && selectedDecision.type === PostDecisionType.Reconsideration;

    const data: CreateApplicationDecisionDto = {
      date: formatDateForApi(date!),
      resolutionNumber: parseInt(resolutionNumber!),
      resolutionYear: resolutionYear!,
      chairReviewRequired: chairReviewRequired === 'true',
      auditDate: auditDate ? formatDateForApi(auditDate) : auditDate,
      chairReviewDate: chairReviewDate ? formatDateForApi(chairReviewDate) : chairReviewDate,
      outcomeCode: outcome!,
      decisionMakerCode: decisionMaker,
      ceoCriterionCode: ceoCriterion,
      chairReviewOutcomeCode: chairReviewOutcome,
      applicationFileNumber: this.data.fileNumber,
      modifiesUuid: isPostDecisionReconsideration ? null : postDecision!,
      reconsidersUuid: isPostDecisionReconsideration ? postDecision! : null,
    };
    if (ceoCriterion && ceoCriterion === CeoCriterion.MODIFICATION) {
      data.isTimeExtension = criterionModification?.includes('isTimeExtension');
      data.isOther = criterionModification?.includes('isOther');
    } else {
      data.isTimeExtension = null;
      data.isOther = null;
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
      this.dialogRef.close(true);
    } finally {
      this.isLoading = false;
    }
  }

  onSelectDecisionMaker(decisionMaker: DecisionMakerDto) {
    if (decisionMaker.code === DecisionMaker.CEO) {
      this.form.controls['ceoCriterion'].setValidators([Validators.required]);
    } else {
      this.form.patchValue({
        ceoCriterion: null,
        criterionModification: [],
      });
      this.form.controls['ceoCriterion'].clearValidators();
    }
    this.form.controls['ceoCriterion'].updateValueAndValidity();
  }

  onSelectCeoCriterion(ceoCriterion: CeoCriterionDto) {
    if (ceoCriterion.code === CeoCriterion.MODIFICATION) {
      this.form.controls['criterionModification'].setValidators([Validators.required]);
    } else {
      this.form.patchValue({
        criterionModification: [],
      });
      this.form.controls['criterionModification'].clearValidators();
    }
    this.form.controls['criterionModification'].updateValueAndValidity();
  }

  onSelectChairReviewRequired($event: MatButtonToggleChange) {
    if ($event.value === 'false') {
      this.form.patchValue({
        chairReviewOutcome: null,
        chairReviewDate: null,
      });
    }
  }

  onSelectPostDecision(postDecision: { type: PostDecisionType }) {
    if (postDecision.type === PostDecisionType.Modification) {
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

  private mapPostDecisionsToControls(
    modifications: ApplicationModificationDto[],
    reconsiderations: ApplicationReconsiderationDto[],
    existingDecision?: ApplicationDecisionDto
  ) {
    const mappedModifications = modifications
      .filter(
        (modification) =>
          (existingDecision && existingDecision.modifies?.uuid === modification.uuid) ||
          (modification.reviewOutcome.code !== 'REF' && modification.resultingDecision === null)
      )
      .map((modification, index) => ({
        label: `Modification Request #${modifications.length - index} - ${modification.modifiesDecisions
          .map((dec) => `#${dec.resolutionNumber}/${dec.resolutionYear}`)
          .join(', ')}`,
        uuid: modification.uuid,
        type: PostDecisionType.Modification,
      }));

    const mappedRecons = reconsiderations
      .filter(
        (reconsideration) =>
          (existingDecision && existingDecision.reconsiders?.uuid === reconsideration.uuid) ||
          (reconsideration.reviewOutcome?.code !== 'REF' && reconsideration.resultingDecision === null)
      )
      .map((reconsideration, index) => ({
        label: `Reconsideration Request #${reconsiderations.length - index} - ${reconsideration.reconsideredDecisions
          .map((dec) => `#${dec.resolutionNumber}/${dec.resolutionYear}`)
          .join(', ')}`,
        uuid: reconsideration.uuid,
        type: PostDecisionType.Reconsideration,
      }));
    this.postDecisions = [...mappedModifications, ...mappedRecons];
  }

  private patchFormWithExistingData(existingDecision: ApplicationDecisionDto) {
    this.isEdit = true;
    this.form.patchValue({
      outcome: existingDecision.outcome.code,
      decisionMaker: existingDecision.decisionMaker?.code,
      ceoCriterion: existingDecision.ceoCriterion?.code,
      date: new Date(existingDecision.date),
      resolutionYear: existingDecision.resolutionYear,
      resolutionNumber: existingDecision.resolutionNumber.toString(10),
      chairReviewRequired: existingDecision.chairReviewRequired ? 'true' : 'false',
      chairReviewDate: existingDecision.chairReviewDate ? new Date(existingDecision.chairReviewDate) : undefined,
      auditDate: existingDecision.auditDate ? new Date(existingDecision.auditDate) : undefined,
      postDecision: existingDecision.modifies?.uuid || existingDecision.reconsiders?.uuid,
    });
    if (existingDecision.reconsiders) {
      this.onSelectPostDecision({
        type: PostDecisionType.Reconsideration,
      });
    }
    if (existingDecision.modifies) {
      this.onSelectPostDecision({
        type: PostDecisionType.Modification,
      });
    }
    const selectedCriterion = [];
    if (existingDecision.isTimeExtension) {
      selectedCriterion.push('isTimeExtension');
    }
    if (existingDecision.isOther) {
      selectedCriterion.push('isOther');
    }
    this.form.patchValue({
      criterionModification: selectedCriterion,
    });

    if (existingDecision.chairReviewOutcome !== null) {
      this.form.patchValue({
        chairReviewOutcome: existingDecision.chairReviewOutcome?.code,
      });
    }
  }
}

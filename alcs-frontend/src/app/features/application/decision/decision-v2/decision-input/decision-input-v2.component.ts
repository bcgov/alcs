import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { combineLatestWith, Subject, takeUntil } from 'rxjs';
import { ApplicationModificationDto } from '../../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../../../../services/application/application.dto';
import {
  ApplicationDecisionDto,
  CeoCriterion,
  CeoCriterionDto,
  CreateApplicationDecisionDto,
  DecisionMaker,
  DecisionMakerDto,
  DecisionOutcomeCodeDto,
} from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { formatDateForApi } from '../../../../../shared/utils/api-date-formatter';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';

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
  selector: 'app-decision-input',
  templateUrl: './decision-input-v2.component.html',
  styleUrls: ['./decision-input-v2.component.scss'],
})
export class DecisionInputV2Component implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  isLoading = false;
  isEdit = false;
  minDate = new Date(0);
  isFirstDecision = false;

  fileNumber: string = '';
  uuid: string = '';
  application: ApplicationDto | undefined;
  outcomes: DecisionOutcomeCodeDto[] = [];
  decisionMakers: DecisionMakerDto[] = [];
  ceoCriterion: CeoCriterionDto[] = [];

  resolutionYears: number[] = [];
  postDecisions: MappedPostDecision[] = [];
  existingDecision: ApplicationDecisionDto | undefined;

  form = new FormGroup({
    outcome: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    decisionMaker: new FormControl<string | null>(null, [Validators.required]),
    postDecision: new FormControl<string | null>(null),
    resolutionNumber: new FormControl<string | null>(null, [Validators.required]),
    resolutionYear: new FormControl<number | null>(null, [Validators.required]),
    chairReviewRequired: new FormControl<string>('true', [Validators.required]),
    chairReviewDate: new FormControl<Date | null>(null),
    chairReviewOutcome: new FormControl<string | null>(null),
    auditDate: new FormControl<Date | null>(null),
    criterionModification: new FormControl<string[]>([]),
    ceoCriterion: new FormControl<string | null>(null),
    isSubjectToConditions: new FormControl<string | undefined>(undefined, [Validators.required]),
    decisionDescription: new FormControl<string | undefined>(undefined, [Validators.required]),
    isStatsRequired: new FormControl<string | undefined>(undefined, [Validators.required]),
    daysHideFromPublic: new FormControl<number>(2, [Validators.required]),
    rescindedDate: new FormControl<Date | undefined>(undefined, [Validators.required]),
    rescindedComment: new FormControl<string | undefined>(undefined, [Validators.required]),
  });

  constructor(
    private decisionService: ApplicationDecisionV2Service,
    private reconsiderationService: ApplicationReconsiderationService,
    private modificationService: ApplicationModificationService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setYear();

    this.extractAndPopulateQueryParams();

    if (this.fileNumber) {
      this.loadData(this.fileNumber);
    }
  }

  private extractAndPopulateQueryParams() {
    const fileNumber = this.route.parent?.parent?.snapshot.paramMap.get('fileNumber');
    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (uuid) {
      this.uuid = uuid;
      this.isEdit = true;
    }

    if (fileNumber) {
      this.fileNumber = fileNumber;
    }
  }

  private setYear() {
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

  ngOnDestroy(): void {
    this.decisionService.cleanDecision();
    this.decisionService.cleanDecisions();
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadData(fileNumber: string) {
    this.decisionService.loadDecision(this.uuid);
    this.decisionService.loadDecisions(this.fileNumber);

    const codes = await this.decisionService.fetchCodes();
    this.outcomes = codes.outcomes;
    this.decisionMakers = codes.decisionMakers;
    this.ceoCriterion = codes.ceoCriterion;

    this.decisionService.$decisions.pipe(takeUntil(this.$destroy)).subscribe((decisions) => {
      if (decisions.length > 0) {
        this.minDate = new Date(decisions[decisions.length - 1].date);
      }
    });

    await this.prepareDataForEdit();
  }

  private async prepareDataForEdit() {
    if (this.isEdit) {
      this.decisionService.$decision
        .pipe(takeUntil(this.$destroy))
        .pipe(
          combineLatestWith(
            this.modificationService.$modifications,
            this.reconsiderationService.$reconsiderations,
            this.decisionService.$decisions
          )
        )
        .subscribe(([decision, modifications, reconsiderations, decisions]) => {
          this.existingDecision = decision;
          this.mapPostDecisionsToControls(modifications, reconsiderations, this.existingDecision);

          if (this.existingDecision) {
            this.patchFormWithExistingData(this.existingDecision);

            if (decisions.length > 0) {
              this.isFirstDecision = decisions.findIndex((dec) => dec.uuid === this.uuid) === 0;

              if (!this.isFirstDecision) {
                this.form.controls.postDecision.addValidators([Validators.required]);
                this.form.controls.decisionMaker.disable();
                this.form.controls.outcome.disable();
              }
            }
          }
        });
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
      date: existingDecision.date ? new Date(existingDecision.date) : undefined,
      resolutionYear: existingDecision.resolutionYear,
      resolutionNumber: existingDecision.resolutionNumber?.toString(10) || undefined,
      chairReviewRequired: existingDecision.chairReviewRequired ? 'true' : 'false',
      chairReviewDate: existingDecision.chairReviewDate ? new Date(existingDecision.chairReviewDate) : undefined,
      auditDate: existingDecision.auditDate ? new Date(existingDecision.auditDate) : undefined,
      postDecision: existingDecision.modifies?.uuid || existingDecision.reconsiders?.uuid,
      isSubjectToConditions: existingDecision.isSubjectToConditions ? 'true' : 'false',
      decisionDescription: existingDecision.decisionDescription,
      isStatsRequired: existingDecision.isStatsRequired ? 'true' : 'false',
      daysHideFromPublic: existingDecision.daysHideFromPublic,
      rescindedDate: existingDecision.rescindedDate ? new Date(existingDecision.rescindedDate) : undefined,
      rescindedComment: existingDecision.rescindedComment,
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
      isSubjectToConditions,
      decisionDescription,
      isStatsRequired,
      daysHideFromPublic,
      rescindedDate,
      rescindedComment,
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
      applicationFileNumber: this.fileNumber,
      modifiesUuid: isPostDecisionReconsideration ? null : postDecision!,
      reconsidersUuid: isPostDecisionReconsideration ? postDecision! : null,
      isDraft: true,
      isSubjectToConditions: parseStringToBoolean(isSubjectToConditions),
      decisionDescription: decisionDescription,
      isStatsRequired: parseStringToBoolean(isStatsRequired),
      daysHideFromPublic: daysHideFromPublic,
      rescindedDate: rescindedDate ? formatDateForApi(rescindedDate) : rescindedDate,
      rescindedComment: rescindedComment,
    };
    if (ceoCriterion && ceoCriterion === CeoCriterion.MODIFICATION) {
      data.isTimeExtension = criterionModification?.includes('isTimeExtension');
      data.isOther = criterionModification?.includes('isOther');
    } else {
      data.isTimeExtension = null;
      data.isOther = null;
    }

    try {
      if (this.existingDecision) {
        await this.decisionService.update(this.existingDecision.uuid, data);
      } else {
        await this.decisionService.create({
          ...data,
          applicationFileNumber: this.fileNumber,
        });
      }
    } finally {
      this.isLoading = false;
      this.onCancel();
    }
  }

  onSelectPostDecision(postDecision: { type: PostDecisionType }) {
    if (postDecision.type === PostDecisionType.Modification) {
      this.form.controls.ceoCriterion.disable();
      this.form.controls.outcome.disable();
      this.form.controls.decisionMaker.disable();
      this.ceoCriterion = this.ceoCriterion.filter((ceoCriterion) => ceoCriterion.code === CeoCriterion.MODIFICATION);
      this.form.patchValue({
        decisionMaker: DecisionMaker.CEO,
        ceoCriterion: CeoCriterion.MODIFICATION,
        outcome: 'VARY',
      });
    } else {
      this.form.controls.decisionMaker.enable();
      this.form.controls.outcome.enable();
      this.form.controls.ceoCriterion.enable();
      this.ceoCriterion = this.ceoCriterion.filter((ceoCriterion) => ceoCriterion.code !== CeoCriterion.MODIFICATION);
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

  async onUploadFile() {
    console.log('There is a separate ticket for this');
  }

  onCancel() {
    this.router.navigate([`application/${this.fileNumber}/decision`]);
  }
}

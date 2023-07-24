import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { combineLatestWith, Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../../services/application/application-detail.service';
import { ApplicationModificationDto } from '../../../../../services/application/application-modification/application-modification.dto';
import { ApplicationModificationService } from '../../../../../services/application/application-modification/application-modification.service';
import { ApplicationReconsiderationDto } from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../../../services/application/application-reconsideration/application-reconsideration.service';
import {
  ApplicationDecisionConditionDto,
  ApplicationDecisionDto,
  CeoCriterion,
  CeoCriterionDto,
  CreateApplicationDecisionDto,
  DecisionCodesDto,
  DecisionComponentDto,
  DecisionMaker,
  DecisionMakerDto,
  DecisionOutcomeCodeDto,
  LinkedResolutionOutcomeTypeDto,
  UpdateApplicationDecisionConditionDto,
} from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../../shared/utils/api-date-formatter';
import { parseBooleanToString, parseStringToBoolean } from '../../../../../shared/utils/boolean-helper';
import { ReleaseDialogComponent } from '../release-dialog/release-dialog.component';
import { DecisionComponentsComponent } from './decision-components/decision-components.component';
import { DecisionConditionsComponent } from './decision-conditions/decision-conditions.component';

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
  minDate = new Date(0);
  isFirstDecision = false;
  showComponents = false;
  showConditions = false;
  conditionsValid = true;
  componentsValid = true;

  fileNumber: string = '';
  uuid: string = '';
  outcomes: DecisionOutcomeCodeDto[] = [];
  decisionMakers: DecisionMakerDto[] = [];
  ceoCriterionItems: CeoCriterionDto[] = [];
  linkedResolutionOutcomes: LinkedResolutionOutcomeTypeDto[] = [];

  resolutionYears: number[] = [];
  postDecisions: MappedPostDecision[] = [];
  existingDecision: ApplicationDecisionDto | undefined;
  codes?: DecisionCodesDto;

  resolutionNumberControl = new FormControl<string | null>(null, [Validators.required]);
  resolutionYearControl = new FormControl<number | null>(null, [Validators.required]);

  components: DecisionComponentDto[] = [];
  conditions: ApplicationDecisionConditionDto[] = [];
  conditionUpdates: UpdateApplicationDecisionConditionDto[] = [];

  @ViewChild(DecisionComponentsComponent) decisionComponentsComponent?: DecisionComponentsComponent;
  @ViewChild(DecisionConditionsComponent) decisionConditionsComponent?: DecisionConditionsComponent;

  form = new FormGroup({
    outcome: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    decisionMaker: new FormControl<string | null>(null, [Validators.required]),
    postDecision: new FormControl<string | null>(null),
    resolutionNumber: this.resolutionNumberControl,
    resolutionYear: this.resolutionYearControl,
    chairReviewRequired: new FormControl<string>('true', [Validators.required]),
    chairReviewDate: new FormControl<Date | null>(null),
    chairReviewOutcome: new FormControl<string | null>(null),
    linkedResolutionOutcome: new FormControl<string | null>(null),
    auditDate: new FormControl<Date | null>(null),
    criterionModification: new FormControl<string[]>([]),
    ceoCriterion: new FormControl<string | null>(null),
    isSubjectToConditions: new FormControl<string | undefined>(undefined, [Validators.required]),
    decisionDescription: new FormControl<string | undefined>(undefined, [Validators.required]),
    isStatsRequired: new FormControl<string | undefined>(undefined, [Validators.required]),
    daysHideFromPublic: new FormControl<string>('2', [Validators.required]),
    rescindedDate: new FormControl<Date | null>({ disabled: true, value: null }),
    rescindedComment: new FormControl<string | null>({ disabled: true, value: null }),
  });

  constructor(
    private decisionService: ApplicationDecisionV2Service,
    private reconsiderationService: ApplicationReconsiderationService,
    private modificationService: ApplicationModificationService,
    public router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private applicationService: ApplicationDetailService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.resolutionYearControl.disable();
    this.setYear();

    this.extractAndPopulateQueryParams();

    if (this.fileNumber) {
      this.loadData();
    }
  }

  private extractAndPopulateQueryParams() {
    const fileNumber = this.route.parent?.parent?.snapshot.paramMap.get('fileNumber');
    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (uuid) {
      this.uuid = uuid;
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
  }

  ngOnDestroy(): void {
    this.decisionService.clearDecision();
    this.decisionService.clearDecisions();
    this.$destroy.next();
    this.$destroy.complete();
  }

  async loadData() {
    if (this.uuid) {
      await this.decisionService.loadDecision(this.uuid);
    }

    await this.decisionService.loadDecisions(this.fileNumber);

    this.codes = await this.decisionService.fetchCodes();
    this.outcomes = this.codes.outcomes;
    this.decisionMakers = this.codes.decisionMakers;
    this.ceoCriterionItems = this.codes.ceoCriterion;
    this.linkedResolutionOutcomes = this.codes.linkedResolutionOutcomeTypes;

    await this.prepareDataForEdit();
  }

  private async prepareDataForEdit() {
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
        if (decision) {
          this.existingDecision = decision;
          this.uuid = decision.uuid;
        }

        this.mapPostDecisionsToControls(modifications, reconsiderations, this.existingDecision);

        if (this.existingDecision) {
          this.patchFormWithExistingData(this.existingDecision);

          if (decisions.length > 0) {
            let minDate = null;
            this.isFirstDecision = true;

            for (const decision of decisions) {
              if (!minDate && decision.date) {
                minDate = decision.date;
              }

              if (minDate && decision.date && minDate > decision.date) {
                minDate = decision.date;
              }

              if (
                this.existingDecision.createdAt > decision.createdAt &&
                this.existingDecision.uuid !== decision.uuid
              ) {
                this.isFirstDecision = false;
              }
            }

            if (minDate) {
              this.minDate = new Date(minDate);
            }

            if (!this.isFirstDecision) {
              this.form.controls.postDecision.addValidators([Validators.required]);
              this.form.controls.decisionMaker.disable();
              this.onSelectPostDecision({
                type: this.existingDecision.modifies ? PostDecisionType.Modification : PostDecisionType.Reconsideration,
              });
            }
          } else {
            this.isFirstDecision = true;
          }
        } else {
          this.resolutionYearControl.enable();
        }
      });
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
          (modification.reviewOutcome.code === 'PRC' && !modification.resultingDecision)
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
          (reconsideration.reviewOutcome?.code === 'PRC' && !reconsideration.resultingDecision)
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
    this.form.patchValue({
      outcome: existingDecision.outcome.code,
      decisionMaker: existingDecision.decisionMaker?.code,
      ceoCriterion: existingDecision.ceoCriterion?.code,
      date: existingDecision.date ? new Date(existingDecision.date) : undefined,
      resolutionYear: existingDecision.resolutionYear,
      resolutionNumber: existingDecision.resolutionNumber?.toString(10) || undefined,
      chairReviewRequired: parseBooleanToString(existingDecision.chairReviewRequired),
      chairReviewDate: existingDecision.chairReviewDate ? new Date(existingDecision.chairReviewDate) : undefined,
      auditDate: existingDecision.auditDate ? new Date(existingDecision.auditDate) : undefined,
      postDecision: existingDecision.modifies?.uuid || existingDecision.reconsiders?.uuid,
      isSubjectToConditions: parseBooleanToString(existingDecision.isSubjectToConditions),
      decisionDescription: existingDecision.decisionDescription,
      isStatsRequired: parseBooleanToString(existingDecision.isStatsRequired),
      daysHideFromPublic: existingDecision.daysHideFromPublic?.toString() ?? '2',
      rescindedDate: existingDecision.rescindedDate ? new Date(existingDecision.rescindedDate) : undefined,
      rescindedComment: existingDecision.rescindedComment,
      linkedResolutionOutcome: existingDecision.linkedResolutionOutcome?.code,
    });

    this.conditions = existingDecision.conditions;

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

    if (existingDecision.isSubjectToConditions) {
      this.showConditions = true;
    }

    if (existingDecision.chairReviewOutcome !== null) {
      this.form.patchValue({
        chairReviewOutcome: existingDecision.chairReviewOutcome?.code,
      });
    }

    if (!existingDecision.resolutionNumber) {
      this.resolutionYearControl.enable();
    }

    if (existingDecision?.components) {
      this.components = existingDecision.components;
    }

    if (['APPR', 'APPA', 'RESC'].includes(existingDecision.outcome.code)) {
      this.showComponents = true;
    } else {
      this.form.controls.isSubjectToConditions.disable();
    }

    if (existingDecision.outcome.code === 'RESC') {
      this.form.controls.rescindedComment.enable();
      this.form.controls.rescindedDate.enable();
      this.form.controls.rescindedComment.setValidators([Validators.required]);
      this.form.controls.rescindedDate.setValidators([Validators.required]);
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

  async onSubmit(isStayOnPage: boolean = false, isDraft: boolean = true) {
    this.isLoading = true;

    try {
      await this.saveDecision(isDraft);
    } finally {
      if (!isStayOnPage) {
        this.onCancel();
      } else {
        await this.loadData();
      }

      this.isLoading = false;
    }
  }

  async saveDecision(isDraft: boolean = true) {
    const data = this.mapDecisionDataForSave(isDraft);

    if (this.uuid) {
      await this.decisionService.update(this.uuid, data);
    } else {
      const createdDecision = await this.decisionService.create({
        ...data,
        applicationFileNumber: this.fileNumber,
      });
      this.uuid = createdDecision.uuid;
    }
  }

  private mapDecisionDataForSave(isDraft: boolean) {
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
      linkedResolutionOutcome,
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
      isDraft,
      isSubjectToConditions: parseStringToBoolean(isSubjectToConditions),
      decisionDescription: decisionDescription,
      isStatsRequired: parseStringToBoolean(isStatsRequired),
      daysHideFromPublic: daysHideFromPublic ? parseInt(daysHideFromPublic) : 2,
      rescindedDate: rescindedDate ? formatDateForApi(rescindedDate) : rescindedDate,
      rescindedComment: rescindedComment,
      decisionComponents: this.components,
      conditions: this.conditionUpdates,
      linkedResolutionOutcomeCode: linkedResolutionOutcome,
    };
    if (ceoCriterion && ceoCriterion === CeoCriterion.MODIFICATION) {
      data.isTimeExtension = criterionModification?.includes('isTimeExtension');
      data.isOther = criterionModification?.includes('isOther');
    } else {
      data.isTimeExtension = null;
      data.isOther = null;
    }

    return data;
  }

  onSelectPostDecision(postDecision: { type: PostDecisionType }) {
    if (postDecision.type === PostDecisionType.Modification) {
      this.ceoCriterionItems =
        this.codes?.ceoCriterion.filter((ceoCriterion) => ceoCriterion.code === CeoCriterion.MODIFICATION) ?? [];
      this.form.controls.ceoCriterion.disable();
      this.form.controls.linkedResolutionOutcome.disable();
      this.form.controls.decisionMaker.disable();

      this.form.patchValue({
        decisionMaker: DecisionMaker.CEO,
        ceoCriterion: CeoCriterion.MODIFICATION,
        linkedResolutionOutcome: 'VARY',
      });
    } else {
      this.form.controls.decisionMaker.enable();
      this.form.controls.linkedResolutionOutcome.enable();
      this.form.controls.ceoCriterion.enable();
      this.ceoCriterionItems =
        this.codes?.ceoCriterion.filter((ceoCriterion) => ceoCriterion.code !== CeoCriterion.MODIFICATION) ?? [];
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

  onCancel() {
    this.router.navigate([`application/${this.fileNumber}/decision`]);
  }

  async onGenerateResolutionNumber() {
    const selectedYear = this.form.controls.resolutionYear.getRawValue();
    if (selectedYear) {
      const number = await this.decisionService.getNextAvailableResolutionNumber(selectedYear);
      if (number) {
        this.setResolutionNumber(number);
      } else {
        this.toastService.showErrorToast('Failed to retrieve resolution number.');
      }
    } else {
      this.toastService.showErrorToast('Resolution year is not selected. Select a resolution year first.');
    }
  }

  private async setResolutionNumber(number: number) {
    try {
      this.resolutionYearControl.disable();
      this.form.controls.resolutionNumber.setValue(number.toString());
      await this.onSubmit(true);
    } catch {
      this.resolutionYearControl.enable();
    }
  }

  async onDeleteResolutionNumber() {
    this.resolutionNumberControl.setValue(null);
    await this.onSubmit(true);
    this.resolutionYearControl.enable();
  }

  private runValidation() {
    this.form.markAllAsTouched();
    this.componentsValid = this.componentsValid && this.components.length > 0;
    this.conditionsValid = this.conditionsValid && this.conditionUpdates.length > 0;

    if (this.decisionComponentsComponent) {
      this.decisionComponentsComponent.onValidate();
    }

    if (this.decisionConditionsComponent) {
      this.decisionConditionsComponent.onValidate();
    }

    if (
      !this.form.valid ||
      !this.conditionsValid ||
      !this.componentsValid ||
      (this.components.length === 0 && this.showComponents) ||
      (this.conditionUpdates.length === 0 && this.showConditions)
    ) {
      this.form.controls.decisionMaker.markAsDirty();
      this.toastService.showErrorToast('Please correct all errors before submitting the form');

      // this will ensure that error rendering complete
      setTimeout(() => this.scrollToError());

      return false;
    } else {
      return true;
    }
  }

  private scrollToError() {
    let elements = document.getElementsByClassName('ng-invalid');
    let elArray = Array.from(elements).filter((el) => el.nodeName !== 'FORM');

    elArray[0]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  async onRelease() {
    if (this.runValidation()) {
      this.dialog
        .open(ReleaseDialogComponent, {
          minWidth: '600px',
          maxWidth: '900px',
          maxHeight: '80vh',
          width: '90%',
          autoFocus: false,
        })
        .afterClosed()
        .subscribe(async (didAccept) => {
          if (didAccept) {
            await this.onSubmit(false, false);
            await this.applicationService.loadApplication(this.fileNumber);
          }
        });
    }
  }

  onComponentChange($event: { components: DecisionComponentDto[]; isValid: boolean }) {
    this.components = Array.from($event.components);
    this.componentsValid = $event.isValid;
  }

  onConditionsChange($event: { conditions: UpdateApplicationDecisionConditionDto[]; isValid: boolean }) {
    this.conditionUpdates = $event.conditions;
    this.conditionsValid = $event.isValid;
    this.conditionUpdates = Array.from($event.conditions);
  }

  onChangeDecisionOutcome(selectedOutcome: DecisionOutcomeCodeDto) {
    if (['APPR', 'APPA', 'RESC'].includes(selectedOutcome.code)) {
      if (this.form.controls.isSubjectToConditions.disabled) {
        this.showComponents = true;
        this.form.controls.isSubjectToConditions.enable();
        this.form.patchValue({
          isSubjectToConditions: null,
        });
        this.showConditions = false;
      }
    } else if (this.form.controls.isSubjectToConditions.enabled) {
      this.showComponents = false;
      this.components = [];
      this.conditions = [];
      this.form.controls.isSubjectToConditions.disable();
      this.form.patchValue({
        isSubjectToConditions: 'false',
      });
    }

    if (selectedOutcome.code === 'RESC' && this.form.controls.rescindedComment.disabled) {
      this.form.controls.rescindedComment.enable();
      this.form.controls.rescindedDate.enable();
      this.form.controls.rescindedComment.setValidators([Validators.required]);
      this.form.controls.rescindedDate.setValidators([Validators.required]);
      this.form.controls.rescindedComment.updateValueAndValidity();
      this.form.controls.rescindedDate.updateValueAndValidity();
    } else if (this.form.controls.rescindedComment.enabled) {
      this.form.controls.rescindedComment.disable();
      this.form.controls.rescindedDate.disable();
      this.form.controls.rescindedComment.setValue(null);
      this.form.controls.rescindedDate.setValue(null);
      this.form.controls.rescindedComment.setValidators([]);
      this.form.controls.rescindedDate.setValidators([]);
      this.form.controls.rescindedComment.updateValueAndValidity();
      this.form.controls.rescindedDate.updateValueAndValidity();
    }
  }

  onChangeSubjectToConditions($event: MatButtonToggleChange) {
    if ($event.value === 'true') {
      this.showConditions = true;
    } else {
      this.conditions = [];
      this.conditionUpdates = [];
      this.showConditions = false;
    }
  }
}

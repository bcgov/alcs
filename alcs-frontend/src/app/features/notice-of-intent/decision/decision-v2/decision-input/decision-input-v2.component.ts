import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { combineLatestWith, Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import {
  CreateNoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionCodesDto,
  NoticeOfIntentDecisionComponentDto,
  NoticeOfIntentDecisionConditionDto,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeCodeDto,
  UpdateNoticeOfIntentDecisionConditionDto,
} from '../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDetailService } from '../../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentModificationDto } from '../../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../../shared/utils/api-date-formatter';
import { parseBooleanToString, parseStringToBoolean } from '../../../../../shared/utils/boolean-helper';
import { ReleaseDialogComponent } from '../release-dialog/release-dialog.component';
import { DecisionComponentsComponent } from './decision-components/decision-components.component';
import { DecisionConditionsComponent } from './decision-conditions/decision-conditions.component';

type MappedPostDecision = {
  label: string;
  uuid: string;
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
  requireComponents = false;
  showConditions = false;
  conditionsValid = true;
  componentsValid = true;
  index = 1;

  fileNumber: string = '';
  uuid: string = '';
  outcomes: NoticeOfIntentDecisionOutcomeCodeDto[] = [];

  resolutionYears: number[] = [];
  postDecisions: MappedPostDecision[] = [];
  existingDecision: NoticeOfIntentDecisionDto | undefined;
  codes?: NoticeOfIntentDecisionCodesDto;

  resolutionNumberControl = new FormControl<string | null>(null, [Validators.required]);
  resolutionYearControl = new FormControl<number | null>(null, [Validators.required]);

  components: NoticeOfIntentDecisionComponentDto[] = [];
  conditions: NoticeOfIntentDecisionConditionDto[] = [];
  conditionUpdates: UpdateNoticeOfIntentDecisionConditionDto[] = [];

  @ViewChild(DecisionComponentsComponent) decisionComponentsComponent?: DecisionComponentsComponent;
  @ViewChild(DecisionConditionsComponent) decisionConditionsComponent?: DecisionConditionsComponent;

  form = new FormGroup({
    outcome: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    decisionMaker: new FormControl<string | null>(null, [Validators.required]),
    postDecision: new FormControl<string | null>(null),
    resolutionNumber: this.resolutionNumberControl,
    resolutionYear: this.resolutionYearControl,
    auditDate: new FormControl<Date | null>(null),
    isSubjectToConditions: new FormControl<string | undefined>(undefined, [Validators.required]),
    decisionDescription: new FormControl<string | undefined>(undefined, [Validators.required]),
    isStatsRequired: new FormControl<string | undefined>(undefined, [Validators.required]),
    rescindedDate: new FormControl<Date | null>(null),
    rescindedComment: new FormControl<string | null>(null),
  });

  constructor(
    private decisionService: NoticeOfIntentDecisionV2Service,
    private modificationService: NoticeOfIntentModificationService,
    public router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
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
    const index = this.route.snapshot.paramMap.get('index');
    this.index = index ? parseInt(index) : 1;

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

    await this.prepareDataForEdit();
  }

  private async prepareDataForEdit() {
    this.decisionService.$decision
      .pipe(takeUntil(this.$destroy))
      .pipe(combineLatestWith(this.modificationService.$modifications, this.decisionService.$decisions))
      .subscribe(([decision, modifications, decisions]) => {
        if (decision) {
          this.existingDecision = decision;
          this.uuid = decision.uuid;
        }

        this.mapPostDecisionsToControls(modifications, this.existingDecision);

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
    modifications: NoticeOfIntentModificationDto[],
    existingDecision?: NoticeOfIntentDecisionDto
  ) {
    this.postDecisions = modifications
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
      }));
  }

  private patchFormWithExistingData(existingDecision: NoticeOfIntentDecisionDto) {
    this.form.patchValue({
      outcome: existingDecision.outcome.code,
      decisionMaker: existingDecision.decisionMaker,
      date: existingDecision.date ? new Date(existingDecision.date) : undefined,
      resolutionYear: existingDecision.resolutionYear,
      resolutionNumber: existingDecision.resolutionNumber?.toString(10) || undefined,
      auditDate: existingDecision.auditDate ? new Date(existingDecision.auditDate) : undefined,
      postDecision: existingDecision.modifies?.uuid,
      isSubjectToConditions: parseBooleanToString(existingDecision.isSubjectToConditions),
      decisionDescription: existingDecision.decisionDescription,
      isStatsRequired: parseBooleanToString(existingDecision.isStatsRequired),
      rescindedDate: existingDecision.rescindedDate ? new Date(existingDecision.rescindedDate) : undefined,
      rescindedComment: existingDecision.rescindedComment,
    });

    this.conditions = existingDecision.conditions;

    if (existingDecision.isSubjectToConditions) {
      this.showConditions = true;
    }

    if (!existingDecision.resolutionNumber) {
      this.resolutionYearControl.enable();
    }

    if (existingDecision?.components) {
      this.components = existingDecision.components;
    }

    this.requireComponents = ['APPR', 'APPA'].includes(existingDecision.outcome.code);

    if (['APPR', 'APPA', 'RESC'].includes(existingDecision.outcome.code)) {
      this.showComponents = true;
    } else {
      this.showComponents = false;
      this.form.controls.isSubjectToConditions.disable();
    }

    if (existingDecision.outcome.code === 'RESC') {
      this.form.controls.rescindedComment.setValidators([Validators.required]);
      this.form.controls.rescindedDate.setValidators([Validators.required]);
    }
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
        fileNumber: this.fileNumber,
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
      auditDate,
      postDecision,
      isSubjectToConditions,
      decisionDescription,
      isStatsRequired,
      rescindedDate,
      rescindedComment,
    } = this.form.getRawValue();

    const data: CreateNoticeOfIntentDecisionDto = {
      date: formatDateForApi(date!),
      resolutionNumber: parseInt(resolutionNumber!),
      resolutionYear: resolutionYear!,
      auditDate: auditDate ? formatDateForApi(auditDate) : auditDate,
      outcomeCode: outcome!,
      fileNumber: this.fileNumber,
      modifiesUuid: postDecision ?? undefined,
      isDraft,
      isSubjectToConditions: parseStringToBoolean(isSubjectToConditions),
      decisionDescription: decisionDescription,
      isStatsRequired: parseStringToBoolean(isStatsRequired),
      rescindedDate: rescindedDate ? formatDateForApi(rescindedDate) : rescindedDate,
      rescindedComment: rescindedComment,
      decisionComponents: this.components,
      conditions: this.conditionUpdates,
      decisionMaker: decisionMaker ?? undefined,
    };

    return data;
  }

  onCancel() {
    this.router.navigate([`notice-of-intent/${this.fileNumber}/decision`]);
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
    const requiresConditions = this.showConditions;
    const requiresComponents = this.showComponents && this.requireComponents;

    if (this.decisionConditionsComponent) {
      this.decisionConditionsComponent.onValidate();
    }

    if (
      !this.form.valid ||
      !this.conditionsValid ||
      !this.componentsValid ||
      (this.components.length === 0 && requiresComponents) ||
      (this.conditionUpdates.length === 0 && requiresConditions)
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
            await this.noticeOfIntentDetailService.load(this.fileNumber);
          }
        });
    }
  }

  onComponentChange($event: { components: NoticeOfIntentDecisionComponentDto[]; isValid: boolean }) {
    this.components = Array.from($event.components);
    this.componentsValid = $event.isValid;
  }

  onConditionsChange($event: { conditions: UpdateNoticeOfIntentDecisionConditionDto[]; isValid: boolean }) {
    this.conditionUpdates = Array.from($event.conditions);
    this.conditionsValid = $event.isValid;
  }

  onChangeDecisionOutcome(selectedOutcome: NoticeOfIntentDecisionOutcomeCodeDto) {
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

    if (selectedOutcome.code === 'RESC') {
      this.form.controls.rescindedComment.setValidators([Validators.required]);
      this.form.controls.rescindedDate.setValidators([Validators.required]);
      this.form.controls.rescindedComment.updateValueAndValidity();
      this.form.controls.rescindedDate.updateValueAndValidity();
    } else if (this.form.controls.rescindedComment.enabled) {
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

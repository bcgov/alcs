import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import {
  catchError,
  combineLatestWith,
  debounceTime,
  filter,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import {
  CreateNoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionCodesDto,
  NoticeOfIntentDecisionComponentDto,
  NoticeOfIntentDecisionConditionDto,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeCodeDto,
  UpdateNoticeOfIntentDecisionConditionDto,
} from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { NoticeOfIntentDetailService } from '../../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentModificationDto } from '../../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../../shared/utils/api-date-formatter';
import { parseBooleanToString, parseStringToBoolean } from '../../../../../shared/utils/boolean-helper';
import { OUTCOMES_WITH_COMPONENTS } from '../decision-v2.component';
import { ReleaseDialogComponent } from '../release-dialog/release-dialog.component';
import { DecisionComponentsComponent } from './decision-components/decision-components.component';
import { DecisionConditionsComponent } from './decision-conditions/decision-conditions.component';
import { InlineNumberComponent } from '../../../../../shared/inline-editors/inline-number/inline-number.component';

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
  showErrors = false;
  index = 1;

  fileNumber: string = '';
  uuid: string = '';
  outcomes: NoticeOfIntentDecisionOutcomeCodeDto[] = [];

  resolutionYears: number[] = [];
  postDecisions: MappedPostDecision[] = [];
  existingDecision: NoticeOfIntentDecisionDto | undefined;
  codes?: NoticeOfIntentDecisionCodesDto;

  resolutionNumberControl = new FormControl<number | null>(null, [Validators.required]);
  resolutionYearControl = new FormControl<number | null>(null, [Validators.required]);

  lastResolutionNumber: number | null = null;

  components: NoticeOfIntentDecisionComponentDto[] = [];
  conditions: NoticeOfIntentDecisionConditionDto[] = [];
  conditionUpdates: UpdateNoticeOfIntentDecisionConditionDto[] = [];

  @ViewChild(DecisionComponentsComponent) decisionComponentsComponent?: DecisionComponentsComponent;
  @ViewChild(DecisionConditionsComponent) decisionConditionsComponent?: DecisionConditionsComponent;
  @ViewChild(InlineNumberComponent) resolutionNumberInput?: InlineNumberComponent;

  form = new FormGroup({
    outcome: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl<Date | undefined>(undefined, [Validators.required]),
    decisionMaker: new FormControl<string | null>(null, [Validators.required]),
    decisionMakerName: new FormControl<string | null>(null),
    postDecision: new FormControl<string | null>(null),
    resolutionNumber: this.resolutionNumberControl,
    resolutionYear: this.resolutionYearControl,
    auditDate: new FormControl<Date | null>(null),
    isSubjectToConditions: new FormControl<string | undefined>(undefined, [Validators.required]),
    decisionDescription: new FormControl<string | undefined>(undefined, [Validators.required]),
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
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.resolutionYearControl.disable();
    this.populateResolutionYears();

    this.extractAndPopulateQueryParams();

    if (this.fileNumber) {
      this.setupSubscribers();
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

  private populateResolutionYears() {
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
    this.modificationService.fetchByFileNumber(this.fileNumber);
    this.outcomes = this.codes.outcomes;
  }

  private setupSubscribers() {
    this.modificationService.$modifications.pipe(takeUntil(this.$destroy)).subscribe((modifications) => {
      this.mapPostDecisionsToControls(modifications, this.existingDecision);
    });

    this.decisionService.$decision
      .pipe(takeUntil(this.$destroy))
      .pipe(filter((decision) => !!decision))
      .pipe(combineLatestWith(this.decisionService.$decisions))
      .subscribe(([decision, decisions]) => {
        if (!decision) {
          return;
        }

        this.existingDecision = decision;
        this.uuid = decision.uuid;

        this.patchFormWithExistingData(this.existingDecision);

        if (decisions.length > 1) {
          let minDate = null;
          this.isFirstDecision = true;

          for (const decision of decisions) {
            //Skip ourselves!
            if (decision.uuid === this.existingDecision.uuid) {
              continue;
            }

            if (!minDate && decision.date) {
              minDate = decision.date;
            }

            if (minDate && decision.date && decision.date < minDate) {
              minDate = decision.date;
            }

            if (this.existingDecision.createdAt > decision.createdAt) {
              this.isFirstDecision = false;
            }
          }

          if (minDate && !this.isFirstDecision) {
            this.minDate = new Date(minDate);
          }

          if (this.isFirstDecision) {
            this.form.controls.postDecision.disable();
          } else {
            this.form.controls.postDecision.enable();
            this.form.controls.postDecision.addValidators([Validators.required]);
          }
        } else {
          this.isFirstDecision = true;
          this.form.controls.postDecision.disable();
        }

        this.resolutionYearControl.enable();
      });
  }

  private mapPostDecisionsToControls(
    modifications: NoticeOfIntentModificationDto[],
    existingDecision?: NoticeOfIntentDecisionDto,
  ) {
    const proceededModifications = modifications.filter(
      (modification) =>
        modification.reviewOutcome.code === 'PRC' &&
        ((existingDecision && existingDecision.modifies?.uuid === modification.uuid) ||
          !modification.resultingDecision),
    );
    this.postDecisions = proceededModifications.map((modification, index) => ({
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
      decisionMakerName: existingDecision.decisionMakerName,
      date: existingDecision.date ? new Date(existingDecision.date) : undefined,
      resolutionYear: existingDecision.resolutionYear,
      resolutionNumber: existingDecision.resolutionNumber,
      auditDate: existingDecision.auditDate ? new Date(existingDecision.auditDate) : undefined,
      postDecision: existingDecision.modifies?.uuid,
      isSubjectToConditions: parseBooleanToString(existingDecision.isSubjectToConditions),
      decisionDescription: existingDecision.decisionDescription,
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

    if (OUTCOMES_WITH_COMPONENTS.includes(existingDecision.outcome.code)) {
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

  async onSubmit(isStayOnPage: boolean = false, isDraft: boolean = true, ccEmails: string[] = [], sendEmail: boolean = true) {
    this.isLoading = true;

    try {
      await this.saveDecision(isDraft, ccEmails, sendEmail);
    } finally {
      if (!isStayOnPage) {
        this.onCancel();
      } else {
        await this.loadData();
      }

      this.isLoading = false;
    }
  }

  async saveDecision(isDraft: boolean = true, ccEmails: string[], sendEmail: boolean = true) {
    const data = this.mapDecisionDataForSave(isDraft, ccEmails, sendEmail);

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

  private mapDecisionDataForSave(isDraft: boolean, ccEmails: string[], sendEmail: boolean = true) {
    const {
      date,
      outcome,
      decisionMaker,
      decisionMakerName,
      resolutionNumber,
      resolutionYear,
      auditDate,
      postDecision,
      isSubjectToConditions,
      decisionDescription,
      rescindedDate,
      rescindedComment,
    } = this.form.getRawValue();

    const data: CreateNoticeOfIntentDecisionDto = {
      date: formatDateForApi(date!),
      resolutionNumber: resolutionNumber ?? undefined,
      resolutionYear: resolutionYear!,
      decisionMakerName,
      auditDate: auditDate ? formatDateForApi(auditDate) : auditDate,
      outcomeCode: outcome!,
      fileNumber: this.fileNumber,
      modifiesUuid: postDecision ?? undefined,
      isDraft,
      isSubjectToConditions: parseStringToBoolean(isSubjectToConditions),
      decisionDescription: decisionDescription,
      rescindedDate: rescindedDate ? formatDateForApi(rescindedDate) : rescindedDate,
      rescindedComment: rescindedComment,
      decisionComponents: this.components,
      conditions: this.conditionUpdates,
      decisionMaker: decisionMaker ?? undefined,
      ccEmails,
      sendEmail,
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

  async onClickResolutionNumberEditButton() {
    this.lastResolutionNumber = this.resolutionNumberControl.value;
    this.resolutionNumberInput?.startEdit();
  }

  async onClickResolutionNumberCancelButton() {
    this.resolutionNumberInput?.cancelEdit();
  }

  async onClickResolutionNumberSaveButton() {
    this.resolutionNumberInput?.confirmEdit();
  }

  async onSaveResolutionNumber(resolutionNumber: string | null) {
    if (resolutionNumber) {
      await this.setResolutionNumber(Number.parseInt(resolutionNumber));
    }
  }

  private async setResolutionNumber(number: number) {
    try {
      this.resolutionYearControl.disable();
      this.form.controls.resolutionNumber.setValue(number);
      await this.onSubmit(true);
    } finally {
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
    this.showErrors = true;
    const requiresConditions = this.showConditions;
    const requiresComponents = this.showComponents && this.requireComponents;

    if (this.decisionConditionsComponent) {
      this.decisionConditionsComponent.onValidate();
    }
    if (this.decisionComponentsComponent) {
      this.decisionComponentsComponent.onValidate();
    }

    if (
      !this.form.valid ||
      !this.existingDecision ||
      this.existingDecision.documents.length === 0 ||
      !this.conditionsValid ||
      !this.componentsValid ||
      (this.components.length === 0 && requiresComponents) ||
      (this.conditionUpdates.length === 0 && requiresConditions) ||
      this.requiredDatesAreMissing() ||
      this.resolutionNumberInput?.isEditing
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

  requiredDatesAreMissing(): boolean {
    return this.conditionUpdates.some(
      (condition) =>
        condition.type?.isDateChecked &&
        condition.type.isDateRequired &&
        (!condition.dates || condition.dates.length === 0),
    );
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
          minWidth: '1080px',
          maxWidth: '1080px',
          maxHeight: '80vh',
          width: '90%',
          autoFocus: false,
          data: {
            fileNumber: this.fileNumber,
          },
        })
        .afterClosed()
        .subscribe(async (res: { confirmed: boolean; ccEmails: string[], sendEmail: boolean }) => {
          if (res.confirmed) {
            await this.onSubmit(false, false, res.ccEmails, res.sendEmail);
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
    if (OUTCOMES_WITH_COMPONENTS.includes(selectedOutcome.code)) {
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

  resolutionNumberAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      return of(control.value).pipe(
        debounceTime(300),
        switchMap(async () => {
          if (this.lastResolutionNumber === control.value) {
            return null;
          }

          if (!this.resolutionYearControl.value) {
            throw Error('Resolution year must be set');
          }

          // prevents the message flash by setting isLoading while fetching codes.
          this.isLoading = true;
          const resolutionNumberExists = await this.decisionService.resolutionNumberExists(
            this.resolutionYearControl.value,
            control.value,
          );
          this.isLoading = false;

          return resolutionNumberExists
            ? { resolutionNumberAlreadyExists: 'Resolution number already in use, pick a different number' }
            : null;
        }),
        catchError((e) => of({ resolutionNumberAlreadyExists: "Can't check resolution number" })),
      );
    };
  }

  clearResolution() {
    this.resolutionNumberControl.setValue(null);
  }
}

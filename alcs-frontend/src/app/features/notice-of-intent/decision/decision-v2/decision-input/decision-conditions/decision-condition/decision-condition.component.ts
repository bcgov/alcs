import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectableComponent, TempNoticeOfIntentDecisionConditionDto } from '../decision-conditions.component';
import { DateType } from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import {
  NoticeOfIntentDecisionConditionDateDto,
  NoticeOfIntentDecisionConditionTypeDto,
} from '../../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionConditionService } from '../../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { MatDialog } from '@angular/material/dialog';
import {
  DecisionConditionDateDialogComponent,
  DueDate,
} from '../../../../../../application/decision/decision-v2/decision-input/decision-conditions/decision-condition/decision-condition-date-dialog/decision-condition-date-dialog.component';
import moment, { Moment } from 'moment';

@Component({
  selector: 'app-noi-decision-condition',
  templateUrl: './decision-condition.component.html',
  styleUrls: ['./decision-condition.component.scss'],
})
export class DecisionConditionComponent implements OnInit, OnChanges {
  @Input() data!: TempNoticeOfIntentDecisionConditionDto;
  @Output() dataChange = new EventEmitter<TempNoticeOfIntentDecisionConditionDto>();
  @Output() remove = new EventEmitter<void>();

  @Input() selectableComponents: SelectableComponent[] = [];

  uuid: string | undefined;

  dates: NoticeOfIntentDecisionConditionDateDto[] = [];

  singleDateLabel = 'End Date';
  showSingleDateField = false;
  showMultiDateUi = false;
  isDateRequired = false;
  showAdmFeeField = false;
  isAdmFeeFieldRequired = false;
  showSecurityAmountField = false;
  isSecurityAmountFieldRequired = false;
  numberOfSelectedConditions = 0;

  componentsToCondition = new FormControl<string[] | null>(null, [Validators.required]);
  approvalDependant = new FormControl<boolean | null>(null, [Validators.required]);

  securityAmount = new FormControl<string | null>(null);
  administrativeFee = new FormControl<string | null>(null);
  description = new FormControl<string | null>(null, [Validators.required]);
  singleDate = new FormControl<Moment | null>(null);
  minDate = new Date(0);

  form = new FormGroup({
    securityAmount: this.securityAmount,
    singleDate: this.singleDate,
    administrativeFee: this.administrativeFee,
    description: this.description,
    componentsToCondition: this.componentsToCondition,
  });

  constructor(
    private decisionConditionService: NoticeOfIntentDecisionConditionService,
    protected dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.uuid = this.data.uuid;

    this.fetchDates(this.data.uuid);

    if (this.data.type) {
      this.initDateUi(this.data.type);
      this.initOptionalFields(this.data.type);
    }

    this.initComponentField(this.data);

    this.form.patchValue({
      securityAmount: this.data.securityAmount?.toString() ?? null,
      administrativeFee: this.data.administrativeFee
        ? this.data.administrativeFee?.toString()
        : this.data.type?.administrativeFeeAmount?.toString(),
      description: this.data.description ?? null,
    });

    this.form.valueChanges.subscribe(this.emitChanges.bind(this));
  }

  emitChanges() {
    const selectedOptions = this.selectableComponents
      .filter((component) => this.componentsToCondition.value?.includes(component.tempId))
      .map((e) => ({
        componentDecisionUuid: e.decisionUuid,
        componentToConditionType: e.code,
        tempId: e.tempId,
      }));

    const conditionDto: TempNoticeOfIntentDecisionConditionDto = {
      type: this.data.type,
      tempUuid: this.data.tempUuid,
      uuid: this.data.uuid,
      approvalDependant: this.approvalDependant.value,
      securityAmount: this.securityAmount.value !== null ? parseFloat(this.securityAmount.value) : undefined,
      administrativeFee: this.administrativeFee.value !== null ? parseFloat(this.administrativeFee.value) : undefined,
      description: this.description.value ?? undefined,
      componentsToCondition: selectedOptions,
    };

    if (this.showSingleDateField) {
      const singleDateDto: NoticeOfIntentDecisionConditionDateDto = {};

      if (this.singleDate.value) {
        singleDateDto.date = this.singleDate.value.toDate().getTime();
      }

      conditionDto.dates = [singleDateDto];
    } else {
      conditionDto.dates = this.dates;
    }

    this.dataChange.emit(conditionDto);
  }

  initDateUi(type: NoticeOfIntentDecisionConditionTypeDto) {
    if (!type.isDateChecked) {
      return;
    }

    this.showSingleDateField = type.dateType === DateType.SINGLE;
    this.showMultiDateUi = type.dateType === DateType.MULTIPLE;

    if (this.showSingleDateField) {
      this.singleDateLabel = type.singleDateLabel ? type.singleDateLabel : 'End Date';
      this.isDateRequired = type.isDateRequired ?? false;

      if (this.isDateRequired) {
        this.singleDate.addValidators(Validators.required);
      }
    }
  }

  initOptionalFields(type: NoticeOfIntentDecisionConditionTypeDto) {
    this.showAdmFeeField = type.isAdministrativeFeeAmountChecked ?? false;
    this.isAdmFeeFieldRequired = type.isAdministrativeFeeAmountRequired ?? false;
    this.showSecurityAmountField = type.isSecurityAmountChecked ? type.isSecurityAmountChecked : false;
    this.isSecurityAmountFieldRequired = type.isSecurityAmountRequired ?? false;

    if (this.isAdmFeeFieldRequired) {
      this.administrativeFee.addValidators(Validators.required);
    }

    if (this.isSecurityAmountFieldRequired) {
      this.securityAmount.addValidators(Validators.required);
    }

    this.numberOfSelectedConditions += [
      this.showSingleDateField,
      this.showAdmFeeField,
      this.showSecurityAmountField,
    ].reduce((sum, flag) => sum + (flag ? 1 : 0), 0);
  }

  initComponentField(condition: TempNoticeOfIntentDecisionConditionDto) {
    const selectedOptions = this.selectableComponents
      .filter((component) => condition.componentsToCondition?.map((e) => e.tempId)?.includes(component.tempId))
      .map((e) => ({
        componentDecisionUuid: e.decisionUuid,
        componentToConditionType: e.code,
        tempId: e.tempId,
      }));

    this.componentsToCondition.setValue(selectedOptions.map((e) => e.tempId) ?? null);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectableComponents']) {
      const selectedOptions = this.selectableComponents
        .filter((component) => this.componentsToCondition.value?.includes(component.tempId))
        .map((e) => ({
          componentDecisionUuid: e.decisionUuid,
          componentToConditionType: e.code,
        }));

      if (selectedOptions && selectedOptions.length < 1) {
        this.componentsToCondition.setValue(null);
      }
    }
  }

  onRemove() {
    this.remove.emit();
  }

  async fetchDates(uuid: string | undefined) {
    if (!uuid) {
      return;
    }

    this.dates = await this.decisionConditionService.getDates(uuid);

    if (this.showSingleDateField && this.dates.length > 0 && this.dates[0].date) {
      this.form.patchValue({ singleDate: moment(this.dates[0].date) });
    }
  }

  formatDate(timestamp: number | undefined): string {
    if (!timestamp) {
      return '';
    }
    return moment(timestamp).format('YYYY-MMM-DD');
  }

  openDateDialog(isAdding: boolean) {
    this.dialog
      .open(DecisionConditionDateDialogComponent, {
        maxHeight: '80vh',
        data: {
          dates: this.dates,
          isAdding,
          isRequired: this.isDateRequired,
        },
      })
      .beforeClosed()
      .subscribe(async (dates: DueDate[]) => {
        if (!this.uuid) {
          return;
        }
        this.dates = dates.map((date) => ({
          uuid: date.uuid,
          date: date.date?.toDate().getTime(),
        }));
        this.emitChanges();
      });
  }
}

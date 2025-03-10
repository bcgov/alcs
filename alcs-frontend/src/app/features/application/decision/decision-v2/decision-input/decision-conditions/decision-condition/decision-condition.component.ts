import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectableComponent, TempApplicationDecisionConditionDto } from '../decision-conditions.component';
import {
  ApplicationDecisionConditionDateDto,
  ApplicationDecisionConditionTypeDto,
  DateType,
} from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { MatDialog } from '@angular/material/dialog';
import {
  DecisionConditionDateDialogComponent,
  DueDate,
} from './decision-condition-date-dialog/decision-condition-date-dialog.component';
import {
  countToString
} from '../../../../../../../shared/utils/count-to-string';
import moment, { Moment } from 'moment';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-app-decision-condition',
  templateUrl: './decision-condition.component.html',
  styleUrls: ['./decision-condition.component.scss'],
})
export class DecisionConditionComponent implements OnInit, OnChanges {
  @Input() data!: TempApplicationDecisionConditionDto;
  _showDateError = false;
  @Input() set showDateError(value: boolean) {
    this._showDateError = value;
  }
  get showDateError(): boolean {
    return this._showDateError && this.isDateRequired && (!this.dates || this.dates.length === 0);
  }
  @Output() dataChange = new EventEmitter<TempApplicationDecisionConditionDto>();
  @Output() remove = new EventEmitter<void>();

  @Input() selectableComponents: SelectableComponent[] = [];
  @Input() index: number = 0;

  uuid: string | undefined;

  private _dates: ApplicationDecisionConditionDateDto[] = [];
  set dates(dates: ApplicationDecisionConditionDateDto[]) {
    this._dates = dates.sort((a, b) => (a.date && b.date ? a.date - b.date : -1));
  }
  get dates(): ApplicationDecisionConditionDateDto[] {
    return this._dates;
  }

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
  description = new FormControl<string | null>(null, [Validators.required]);

  securityAmount = new FormControl<string | null>(null);
  administrativeFee = new FormControl<string | null>(null);
  singleDate = new FormControl<Moment | null>(null);
  minDate = new Date(0);

  form = new FormGroup({
    securityAmount: this.securityAmount,
    administrativeFee: this.administrativeFee,
    description: this.description,
    componentsToCondition: this.componentsToCondition,
    singleDate: this.singleDate,
  });

  constructor(protected dialog: MatDialog) {}

  ngOnInit(): void {
    this.uuid = this.data.uuid;
    this.dates = this.data.dates ?? [];

    this.form.valueChanges.pipe(startWith(null)).subscribe(this.emitChanges.bind(this));

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

    if (this.showSingleDateField && this.dates.length > 0 && this.dates[0].date) {
      this.form.patchValue({ singleDate: moment(this.dates[0].date) });
    }
  }

  emitChanges() {
    const selectedOptions = this.selectableComponents
      .filter((component) => this.componentsToCondition.value?.includes(component.tempId))
      .map((e) => ({
        componentDecisionUuid: e.decisionUuid,
        componentToConditionType: e.code,
        tempId: e.tempId,
      }));

    const conditionDto: TempApplicationDecisionConditionDto = {
      type: this.data.type,
      tempUuid: this.data.tempUuid,
      uuid: this.data.uuid,
      securityAmount: this.securityAmount.value !== null ? parseFloat(this.securityAmount.value) : undefined,
      administrativeFee: this.administrativeFee.value !== null ? parseFloat(this.administrativeFee.value) : undefined,
      description: this.description.value ?? undefined,
      componentsToCondition: selectedOptions,
      order: this.data.order,
    };

    if (this.showSingleDateField) {
      const singleDateDto: ApplicationDecisionConditionDateDto = {};

      if (this.singleDate.value) {
        if (this.data.dates && this.data.dates.length > 0) {
          singleDateDto.uuid = this.data.dates[0].uuid;
          singleDateDto.completedDate = this.data.dates[0].completedDate;
          singleDateDto.comment = this.data.dates[0].comment;
        }
        singleDateDto.date = this.singleDate.value.toDate().getTime();
      }

      conditionDto.dates = [singleDateDto];
    } else {
      conditionDto.dates = this.dates;
    }

    this.dataChange.emit(conditionDto);
  }

  initDateUi(type: ApplicationDecisionConditionTypeDto) {
    if (!type.isDateChecked) {
      return;
    }

    this.isDateRequired = type.isDateRequired ?? false;
    this.showSingleDateField = type.dateType === DateType.SINGLE;
    this.showMultiDateUi = type.dateType === DateType.MULTIPLE;

    if (this.showSingleDateField) {
      this.singleDateLabel = type.singleDateLabel ? type.singleDateLabel : 'End Date';

      if (this.isDateRequired) {
        this.singleDate.addValidators(Validators.required);
      }
    }
  }

  initOptionalFields(type: ApplicationDecisionConditionTypeDto) {
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

  initComponentField(condition: TempApplicationDecisionConditionDto) {
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

  formatDate(timestamp: number | undefined): string {
    if (!timestamp) {
      return 'No Data';
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
      .subscribe(async (dates: DueDate[] | null) => {
        if (!dates) {
          return;
        }
        this.dates = dates.map((date) => ({
          uuid: date.uuid,
          date: date.date?.toDate().getTime(),
        }));
        this.emitChanges();
      });
  }

  alphaIndex(index: number) {
    return countToString(index);
  }
}

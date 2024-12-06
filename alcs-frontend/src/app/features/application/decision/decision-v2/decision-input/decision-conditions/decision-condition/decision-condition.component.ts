import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectableComponent, TempApplicationDecisionConditionDto } from '../decision-conditions.component';
import {
  ApplicationDecisionConditionDateDto,
  DateType,
} from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionConditionService } from 'src/app/services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';
import { MatDialog } from '@angular/material/dialog';
import { DecisionConditionDateDialogComponent } from './decision-condition-date-dialog/decision-condition-date-dialog.component';

@Component({
  selector: 'app-app-decision-condition',
  templateUrl: './decision-condition.component.html',
  styleUrls: ['./decision-condition.component.scss'],
})
export class DecisionConditionComponent implements OnInit, OnChanges {
  @Input() data!: TempApplicationDecisionConditionDto;
  @Output() dataChange = new EventEmitter<TempApplicationDecisionConditionDto>();
  @Output() remove = new EventEmitter<void>();

  @Input() selectableComponents: SelectableComponent[] = [];

  dates: ApplicationDecisionConditionDateDto[] = [];

  singleDateLabel = 'End Date';
  showSingleDateField = false;
  isShowSingleDateRequired = false;
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
  singleDate = new FormControl<Date | null>(null);
  minDate = new Date(0);

  form = new FormGroup({
    securityAmount: this.securityAmount,
    singleDate: this.singleDate,
    administrativeFee: this.administrativeFee,
    description: this.description,
    componentsToCondition: this.componentsToCondition,
  });

  constructor(
    private decisionConditionService: ApplicationDecisionConditionService,
    protected dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.fetchDates(this.data.uuid);

      this.singleDateLabel = this.data.type?.singleDateLabel ? this.data.type?.singleDateLabel : 'End Date';
      this.showSingleDateField = this.data.type?.dateType === DateType.SINGLE;
      if (this.data.type?.isDateRequired) {
        this.singleDate.addValidators(Validators.required);
        this.isShowSingleDateRequired = true;
      } else {
        this.singleDate.removeValidators(Validators.required);
        this.isShowSingleDateRequired = false;
      }

      this.showAdmFeeField = this.data.type?.isAdministrativeFeeAmountChecked
        ? this.data.type?.isAdministrativeFeeAmountChecked
        : false;
      if (this.data.type?.isAdministrativeFeeAmountRequired) {
        this.administrativeFee.addValidators(Validators.required);
        this.isAdmFeeFieldRequired = true;
      } else {
        this.administrativeFee.removeValidators(Validators.required);
        this.isAdmFeeFieldRequired = false;
      }

      this.showSecurityAmountField = this.data.type?.isSecurityAmountChecked
        ? this.data.type?.isSecurityAmountChecked
        : false;
      if (this.data.type?.isSecurityAmountRequired) {
        this.securityAmount.addValidators(Validators.required);
        this.isSecurityAmountFieldRequired = true;
      } else {
        this.securityAmount.removeValidators(Validators.required);
        this.isSecurityAmountFieldRequired = false;
      }

      if (this.showSingleDateField) {
        this.numberOfSelectedConditions++;
      }
      if (this.showAdmFeeField) {
        this.numberOfSelectedConditions++;
      }
      if (this.showSecurityAmountField) {
        this.numberOfSelectedConditions++;
      }

      const selectedOptions = this.selectableComponents
        .filter((component) => this.data.componentsToCondition?.map((e) => e.tempId)?.includes(component.tempId))
        .map((e) => ({
          componentDecisionUuid: e.decisionUuid,
          componentToConditionType: e.code,
          tempId: e.tempId,
        }));

      this.componentsToCondition.setValue(selectedOptions.map((e) => e.tempId) ?? null);

      this.form.patchValue({
        securityAmount: this.data.securityAmount?.toString() ?? null,
        administrativeFee: this.data.administrativeFee
          ? this.data.administrativeFee?.toString()
          : this.data.type?.administrativeFeeAmount?.toString(),
        description: this.data.description ?? null,
        singleDate: this.dates.length > 0 && this.dates[0].date ? new Date(this.dates[0].date) : null,
      });
    }

    this.form.valueChanges.subscribe((changes) => {
      const selectedOptions = this.selectableComponents
        .filter((component) => this.componentsToCondition.value?.includes(component.tempId))
        .map((e) => ({
          componentDecisionUuid: e.decisionUuid,
          componentToConditionType: e.code,
          tempId: e.tempId,
        }));
      this.dataChange.emit({
        type: this.data.type,
        tempUuid: this.data.tempUuid,
        uuid: this.data.uuid,
        approvalDependant: this.approvalDependant.value,
        securityAmount: this.securityAmount.value !== null ? parseFloat(this.securityAmount.value) : undefined,
        administrativeFee: this.administrativeFee.value !== null ? parseFloat(this.administrativeFee.value) : undefined,
        description: this.description.value ?? undefined,
        componentsToCondition: selectedOptions,
      });
    });
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
  }

  openDateDialog() {
    this.dialog
      .open(DecisionConditionDateDialogComponent, {
        maxHeight: '80vh',
        data: {
          dates: this.dates,
          isAdding: true,
        },
      })
      .beforeClosed()
      .subscribe((data) => {
        // TODO: Handle save
      });
  }
}

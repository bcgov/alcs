import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectableComponent, TempApplicationDecisionConditionDto } from '../decision-conditions.component';

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

  singleDateLabel = 'End Date';

  componentsToCondition = new FormControl<string[] | null>(null, [Validators.required]);
  approvalDependant = new FormControl<boolean | null>(null, [Validators.required]);

  securityAmount = new FormControl<string | null>(null);
  administrativeFee = new FormControl<string | null>(null);
  description = new FormControl<string | null>(null, [Validators.required]);
  singleDate = new FormControl<Date | null>(null, [Validators.required]);
  minDate = new Date(0);

  form = new FormGroup({
    approvalDependant: this.approvalDependant,
    securityAmount: this.securityAmount,
    singleDate: this.singleDate,
    administrativeFee: this.administrativeFee,
    description: this.description,
    componentsToCondition: this.componentsToCondition,
  });

  ngOnInit(): void {
    if (this.data) {
      this.singleDateLabel = this.data.type?.singleDateLabel ? this.data.type?.singleDateLabel : 'End Date';
      const selectedOptions = this.selectableComponents
        .filter((component) => this.data.componentsToCondition?.map((e) => e.tempId)?.includes(component.tempId))
        .map((e) => ({
          componentDecisionUuid: e.decisionUuid,
          componentToConditionType: e.code,
          tempId: e.tempId,
        }));

      this.componentsToCondition.setValue(selectedOptions.map((e) => e.tempId) ?? null);

      this.form.patchValue({
        approvalDependant: this.data.approvalDependant,
        securityAmount: this.data.securityAmount?.toString() ?? null,
        administrativeFee: this.data.administrativeFee !== null ? this.data.administrativeFee?.toString() : this.data.type?.administrativeFeeAmount?.toString(),
        description: this.data.description ?? null,
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
}

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { parseStringToBoolean } from '../../../../../../../shared/utils/boolean-helper';
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

  componentsToCondition = new FormControl<string[] | null>(null, [Validators.required]);
  approvalDependant = new FormControl<string | null>(null, [Validators.required]);

  securityAmount = new FormControl<string | null>(null);
  administrativeFee = new FormControl<string | null>(null);
  description = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    approvalDependant: this.approvalDependant,
    securityAmount: this.securityAmount,
    administrativeFee: this.administrativeFee,
    description: this.description,
    componentsToCondition: this.componentsToCondition,
  });

  ngOnInit(): void {
    if (this.data) {
      let approvalDependant = null;
      if (this.data.approvalDependant !== null) {
        approvalDependant = this.data.approvalDependant ? 'true' : 'false';
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
        approvalDependant,
        securityAmount: this.data.securityAmount?.toString() ?? null,
        administrativeFee: this.data.administrativeFee?.toString() ?? null,
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
        approvalDependant: parseStringToBoolean(this.approvalDependant.value),
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
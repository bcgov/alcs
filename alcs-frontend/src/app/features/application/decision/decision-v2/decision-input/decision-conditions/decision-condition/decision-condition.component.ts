import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApplicationDecisionConditionTypeDto } from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { parseStringToBoolean } from '../../../../../../../shared/utils/boolean-helper';
import { SelectableComponent, TempApplicationDecisionConditionDto } from '../decision-conditions.component';

@Component({
  selector: 'app-decision-condition',
  templateUrl: './decision-condition.component.html',
  styleUrls: ['./decision-condition.component.scss'],
})
export class DecisionConditionComponent implements OnInit, OnChanges {
  @Input() data!: TempApplicationDecisionConditionDto;
  @Output() dataChange = new EventEmitter<TempApplicationDecisionConditionDto>();

  @Input() codes!: ApplicationDecisionConditionTypeDto[];
  @Input() selectableComponents: SelectableComponent[] = [];

  type = new FormControl<string | null>(null, [Validators.required]);
  componentsToCondition = new FormControl<string[] | null>(null, [Validators.required]);
  approvalDependant = new FormControl<string | null>(null, [Validators.required]);

  securityAmount = new FormControl<string | null>(null);
  administrativeFee = new FormControl<string | null>(null);
  description = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    type: this.type,
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
        type: this.data.type?.code ?? null,
        approvalDependant,
        securityAmount: this.data.securityAmount?.toString() ?? null,
        administrativeFee: this.data.administrativeFee?.toString() ?? null,
        description: this.data.description ?? null,
      });
    }

    this.form.valueChanges.subscribe((changes) => {
      const matchingType = this.codes.find((code) => code.code === this.type.value);

      const selectedOptions = this.selectableComponents
        .filter((component) => this.componentsToCondition.value?.includes(component.tempId))
        .map((e) => ({
          componentDecisionUuid: e.decisionUuid,
          componentToConditionType: e.code,
        }));

      this.dataChange.emit({
        tempUuid: this.data.tempUuid,
        uuid: this.data.uuid,
        type: matchingType ?? null,
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
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DecisionComponentDto } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { AG_CAP_OPTIONS, AG_CAP_SOURCE_OPTIONS } from '../../../../proposal/proposal.component';

export type DecisionComponentDataDto = {
  alrArea?: number | null;
  agCap?: string | null;
  agCapSource?: string | null;
  agCapMap?: string | null;
  agCapConsultant?: string | null;
};

@Component({
  selector: 'app-decision-component',
  templateUrl: './decision-component.component.html',
  styleUrls: ['./decision-component.component.scss'],
})
export class DecisionComponentComponent {
  @Input() data!: DecisionComponentDto;
  @Output() dataChange = new EventEmitter<DecisionComponentDto>();

  agCapOptions = AG_CAP_OPTIONS;
  agCapSourceOptions = AG_CAP_SOURCE_OPTIONS;

  alrArea = new FormControl<number | null>(null, [Validators.required]);
  agCap = new FormControl<string | null>(null, [Validators.required]);
  agCapSource = new FormControl<string | null>(null, [Validators.required]);
  agCapMap = new FormControl<string | null>(null);
  agCapConsultant = new FormControl<string | null>(null);

  form = new FormGroup({
    alrArea: this.alrArea,
    agCap: this.agCap,
    agCapSource: this.agCapSource,
    agCapMap: this.agCapMap,
    agCapConsultant: this.agCapConsultant,
  });

  ngOnInit(): void {
    if (this.data) {
      console.log('onInit data', this.data);
      this.alrArea.setValue(this.data.alrArea ? this.data.alrArea : null);
      this.agCap.setValue(this.data.agCap ? this.data.agCap : null);
      this.agCapSource.setValue(this.data.agCapSource ? this.data.agCapSource : null);
      this.agCapMap.setValue(this.data.agCapMap ? this.data.agCapMap : null);
      this.agCapConsultant.setValue(this.data.agCapConsultant ? this.data.agCapConsultant : null);
    }

    this.form.valueChanges.subscribe((changes) => {
      this.dataChange.emit({
        alrArea: this.alrArea.value ? this.alrArea.value : null,
        agCap: this.agCap.value ? this.agCap.value : null,
        agCapSource: this.agCapSource.value ? this.agCapSource.value : null,
        agCapMap: this.agCapMap.value ? this.agCapMap.value : null,
        agCapConsultant: this.agCapConsultant.value ? this.agCapConsultant.value : null,
        applicationDecisionComponentTypeCode: this.data.applicationDecisionComponentTypeCode,
        applicationDecisionUuid: this.data.uuid,
        uuid: this.data.uuid,
      });
    });
  }
}

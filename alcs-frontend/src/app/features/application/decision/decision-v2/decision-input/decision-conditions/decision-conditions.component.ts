import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import {
  ApplicationDecisionConditionDto,
  DecisionCodesDto,
} from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

export type TempApplicationDecisionConditionDto = ApplicationDecisionConditionDto & { tempUuid?: string };

@Component({
  selector: 'app-decision-conditions',
  templateUrl: './decision-conditions.component.html',
  styleUrls: ['./decision-conditions.component.scss'],
})
export class DecisionConditionsComponent implements OnInit, OnDestroy {
  @Input()
  codes!: DecisionCodesDto;
  @Input()
  fileNumber!: string;

  @Input()
  conditions: TempApplicationDecisionConditionDto[] = [];
  @Output() conditionsChange = new EventEmitter<TempApplicationDecisionConditionDto[]>();

  $destroy = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    //WHY
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onAddNewCondition() {
    this.conditions.push({
      tempUuid: (Math.random() * 10000).toFixed(0),
    });
  }

  trackByFn(index: any, item: TempApplicationDecisionConditionDto) {
    if (item.uuid) {
      return item.uuid;
    }
    return item.tempUuid;
  }

  onRemoveCondition(index: number) {
    this.conditions.splice(index, 1);
  }
}

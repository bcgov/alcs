import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { combineLatestWith, Subject, takeUntil } from 'rxjs';
import {
  DecisionCodesDto,
  DecisionComponentDto,
  UpdateApplicationDecisionConditionDto,
} from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';

export type TempApplicationDecisionConditionDto = UpdateApplicationDecisionConditionDto & { tempUuid?: string };

export type SelectableComponent = { uuid?: string; tempId: string; decisionUuid: string; code: string; label: string };

@Component({
  selector: 'app-decision-conditions',
  templateUrl: './decision-conditions.component.html',
  styleUrls: ['./decision-conditions.component.scss'],
})
export class DecisionConditionsComponent implements OnInit, OnChanges, OnDestroy {
  $destroy = new Subject<void>();

  @Input() decisionUuid!: string;
  @Input() codes!: DecisionCodesDto;
  @Input() components: DecisionComponentDto[] = [];

  @Output() conditionsChange = new EventEmitter<UpdateApplicationDecisionConditionDto[]>();
  selectableComponents: SelectableComponent[] = [];
  private allComponents: SelectableComponent[] = [];
  mappedConditions: TempApplicationDecisionConditionDto[] = [];

  constructor(private decisionService: ApplicationDecisionV2Service) {}

  ngOnInit(): void {
    this.decisionService.$decision
      .pipe(takeUntil(this.$destroy))
      .pipe(combineLatestWith(this.decisionService.$decisions))
      .subscribe(([decision, decisions]) => {
        const result = [];
        for (const decision of decisions) {
          const mappedConditions = this.mapComponents(decision.uuid, decision.components);
          result.push(...mappedConditions);
        }
        this.allComponents = result;
        this.selectableComponents = [...this.allComponents];

        if (decision) {
          this.mappedConditions = decision.conditions.map((condition) => {
            const selectedComponent = this.selectableComponents.find(
              (component) => component.uuid === condition.componentUuid
            );

            return {
              ...condition,
              componentToConditionType: selectedComponent?.code,
              componentDecisionUuid: selectedComponent?.decisionUuid,
            };
          });
          this.onChanges();
        }
      });
  }

  onAddNewCondition() {
    this.mappedConditions.push({
      tempUuid: (Math.random() * 10000).toFixed(0),
    });
    this.conditionsChange.emit(this.mappedConditions);
  }

  trackByFn(index: any, item: TempApplicationDecisionConditionDto) {
    if (item.uuid) {
      return item.uuid;
    }
    return item.tempUuid;
  }

  onRemoveCondition(index: number) {
    this.mappedConditions.splice(index, 1);
    this.conditionsChange.emit(this.mappedConditions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const updatedMap = this.mapComponents(this.decisionUuid, this.components);
    this.selectableComponents = [...this.allComponents, ...updatedMap];
  }

  mapComponents(decisionUuid: string, components: DecisionComponentDto[]) {
    return components.map((component) => {
      const matchingType = this.codes.decisionComponentTypes.find(
        (type) => type.code === component.applicationDecisionComponentTypeCode
      );
      return {
        uuid: component.uuid,
        decisionUuid,
        code: component.applicationDecisionComponentTypeCode,
        label: `Draft ${matchingType?.label}`,
        tempId: `${decisionUuid}_${component.applicationDecisionComponentTypeCode}`,
      };
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onChanges() {
    this.conditionsChange.emit(this.mappedConditions);
  }
}

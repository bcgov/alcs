import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { combineLatestWith, Subject, takeUntil } from 'rxjs';
import {
  ApplicationDecisionDto,
  DecisionCodesDto,
  DecisionComponentDto,
  UpdateApplicationDecisionConditionDto,
} from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { DecisionConditionComponent } from './decision-condition/decision-condition.component';

export type TempApplicationDecisionConditionDto = UpdateApplicationDecisionConditionDto & { tempUuid?: string };
export type SelectableComponent = { uuid?: string; tempId: string; decisionUuid: string; code: string; label: string };

@Component({
  selector: 'app-decision-conditions',
  templateUrl: './decision-conditions.component.html',
  styleUrls: ['./decision-conditions.component.scss'],
})
export class DecisionConditionsComponent implements OnInit, OnChanges, OnDestroy {
  $destroy = new Subject<void>();

  @Input() codes!: DecisionCodesDto;
  @Input() components: DecisionComponentDto[] = [];
  @ViewChildren(DecisionConditionComponent) conditionComponents: DecisionConditionComponent[] = [];

  @Output() conditionsChange = new EventEmitter<{
    conditions: UpdateApplicationDecisionConditionDto[];
    isValid: boolean;
  }>();
  selectableComponents: SelectableComponent[] = [];
  private allComponents: SelectableComponent[] = [];
  mappedConditions: TempApplicationDecisionConditionDto[] = [];
  decision: ApplicationDecisionDto | undefined;

  constructor(private decisionService: ApplicationDecisionV2Service) {}

  ngOnInit(): void {
    this.decisionService.$decision
      .pipe(takeUntil(this.$destroy))
      .pipe(combineLatestWith(this.decisionService.$decisions))
      .subscribe(([selectedDecision, decisions]) => {
        const result = [];
        for (const decision of decisions) {
          const mappedComponents = this.mapComponents(
            decision.uuid,
            decision.components,
            decision.resolutionNumber,
            decision.resolutionYear
          );
          const otherDecisionsComponents = mappedComponents.filter(
            (component) => component.decisionUuid !== decision.uuid
          );
          result.push(...otherDecisionsComponents);
        }
        this.allComponents = result;
        this.selectableComponents = [...this.allComponents];

        if (selectedDecision) {
          const updatedComponents = this.mapComponents(
            selectedDecision.uuid,
            selectedDecision.components,
            selectedDecision.resolutionNumber,
            selectedDecision.resolutionYear
          );
          this.selectableComponents = [...this.allComponents, ...updatedComponents];

          this.decision = selectedDecision;
          this.mappedConditions = selectedDecision.conditions.map((condition) => {
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
    this.conditionsChange.emit({
      conditions: this.mappedConditions,
      isValid: false,
    });
  }

  trackByFn(index: any, item: TempApplicationDecisionConditionDto) {
    if (item.uuid) {
      return item.uuid;
    }
    return item.tempUuid;
  }

  onRemoveCondition(index: number) {
    this.mappedConditions.splice(index, 1);
    this.onChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.decision) {
      const updatedComponents = this.mapComponents(
        this.decision.uuid,
        this.components,
        this.decision.resolutionNumber,
        this.decision.resolutionYear
      );
      this.selectableComponents = [...this.allComponents, ...updatedComponents];
    }
  }

  mapComponents(
    decisionUuid: string,
    components: DecisionComponentDto[],
    decisionNumber: number | null,
    decisionYear: number | null
  ) {
    return components.map((component) => {
      const matchingType = this.codes.decisionComponentTypes.find(
        (type) => type.code === component.applicationDecisionComponentTypeCode
      );
      return {
        uuid: component.uuid,
        decisionUuid: decisionUuid,
        code: component.applicationDecisionComponentTypeCode,
        label:
          decisionNumber && decisionYear
            ? `#${decisionNumber}/${decisionYear} ${matchingType?.label}`
            : `Draft ${matchingType?.label}`,
        tempId: `${decisionUuid}_${component.applicationDecisionComponentTypeCode}`,
      };
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onChanges() {
    this.conditionsChange.emit({
      conditions: this.mappedConditions,
      isValid: this.conditionComponents.reduce((isValid, component) => isValid && component.form.valid, true),
    });
  }
}

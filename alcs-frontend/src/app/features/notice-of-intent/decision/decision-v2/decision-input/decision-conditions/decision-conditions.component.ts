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
import { NoticeOfIntentDecisionV2Service } from '../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import {
  NoticeOfIntentDecisionComponentDto,
  NoticeOfIntentDecisionConditionDto,
  NoticeOfIntentDecisionConditionTypeDto,
  NoticeOfIntentDecisionDto,
  UpdateNoticeOfIntentDecisionConditionDto,
} from '../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DecisionConditionComponent } from './decision-condition/decision-condition.component';
import { DecisionComponentTypeDto } from 'src/app/services/application/decision/application-decision-v2/application-decision-v2.dto';

export type TempNoticeOfIntentDecisionConditionDto = UpdateNoticeOfIntentDecisionConditionDto & { tempUuid?: string };
export type SelectableComponent = { uuid?: string; tempId: string; decisionUuid: string; code: string; label: string };

@Component({
  selector: 'app-noi-decision-conditions',
  templateUrl: './decision-conditions.component.html',
  styleUrls: ['./decision-conditions.component.scss'],
})
export class DecisionConditionsComponent implements OnInit, OnChanges, OnDestroy {
  $destroy = new Subject<void>();

  activeTypes!: NoticeOfIntentDecisionConditionTypeDto[];
  @Input() set types(types: NoticeOfIntentDecisionConditionTypeDto[]) {
    this.activeTypes = types.filter((type) => type.isActive);
    console.log(this.activeTypes);
  }
  @Input() componentTypes!: DecisionComponentTypeDto[];
  @Input() components: NoticeOfIntentDecisionComponentDto[] = [];
  @Input() conditions: NoticeOfIntentDecisionConditionDto[] = [];
  @Input() showError = false;
  @ViewChildren(DecisionConditionComponent) conditionComponents: DecisionConditionComponent[] = [];

  @Output() conditionsChange = new EventEmitter<{
    conditions: UpdateNoticeOfIntentDecisionConditionDto[];
    isValid: boolean;
  }>();
  selectableComponents: SelectableComponent[] = [];
  private allComponents: SelectableComponent[] = [];
  mappedConditions: TempNoticeOfIntentDecisionConditionDto[] = [];
  decision: NoticeOfIntentDecisionDto | undefined;

  constructor(
    private decisionService: NoticeOfIntentDecisionV2Service,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    this.decisionService.$decision
      .pipe(takeUntil(this.$destroy))
      .pipe(combineLatestWith(this.decisionService.$decisions))
      .subscribe(([selectedDecision, decisions]) => {
        const otherDecisionComponents = [];
        for (const decision of decisions) {
          const mappedComponents = this.mapComponents(
            decision.uuid,
            decision.components,
            decision.resolutionNumber,
            decision.resolutionYear,
          );
          const otherDecisionsComponents = mappedComponents.filter(
            (component) => component.decisionUuid !== selectedDecision?.uuid,
          );
          otherDecisionComponents.push(...otherDecisionsComponents);
        }
        this.allComponents = otherDecisionComponents;
        this.selectableComponents = [...this.allComponents];

        if (selectedDecision) {
          const updatedComponents = this.mapComponents(
            selectedDecision.uuid,
            this.components,
            selectedDecision.resolutionNumber,
            selectedDecision.resolutionYear,
          );
          this.selectableComponents = [...this.allComponents, ...updatedComponents];

          this.decision = selectedDecision;

          this.populateConditions(selectedDecision.conditions);
          this.onChanges();
        }
      });
  }

  onAddNewCondition(typeCode: string) {
    const matchingType = this.activeTypes.find((code) => code.code === typeCode);
    this.mappedConditions.unshift({
      type: matchingType,
      tempUuid: (Math.random() * 10000).toFixed(0),
    });
    this.conditionsChange.emit({
      conditions: this.mappedConditions,
      isValid: false,
    });
  }

  trackByFn(index: any, item: TempNoticeOfIntentDecisionConditionDto) {
    if (item.uuid) {
      return item.uuid;
    }
    return item.tempUuid;
  }

  onRemoveCondition(index: number) {
    this.confirmationDialogService
      .openDialog({
        body: 'Are you sure you want to remove this condition?',
      })
      .subscribe((didConfirm) => {
        if (didConfirm) {
          this.mappedConditions.splice(index, 1);
          this.onChanges();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.decision && changes['components']) {
      const updatedComponents = this.mapComponents(
        this.decision.uuid,
        this.components,
        this.decision.resolutionNumber,
        this.decision.resolutionYear,
      );
      this.selectableComponents = [...this.allComponents, ...updatedComponents];
      const validComponentIds = this.selectableComponents.map((component) => component.tempId);

      this.mappedConditions = this.mappedConditions.map((condition) => {
        if (condition.componentsToCondition) {
          condition.componentsToCondition = condition.componentsToCondition.filter((component) =>
            validComponentIds.includes(component.tempId),
          );
        }
        return condition;
      });
      this.onChanges();
    }

    if (changes['conditions']) {
      this.populateConditions(this.conditions);
      this.onChanges();
    }
  }

  private populateConditions(conditions: NoticeOfIntentDecisionConditionDto[]) {
    this.mappedConditions = conditions.map((condition) => {
      const selectedComponents = this.selectableComponents
        .filter((component) =>
          condition.components?.map((conditionComponent) => conditionComponent.uuid).includes(component.uuid),
        )
        .map((e) => ({
          componentDecisionUuid: e.decisionUuid,
          componentToConditionType: e.code,
          tempId: e.tempId,
          uuid: e.uuid,
        }));

      return {
        ...condition,
        componentsToCondition: selectedComponents,
      };
    });
  }

  mapComponents(
    decisionUuid: string,
    components: NoticeOfIntentDecisionComponentDto[],
    decisionNumber: number | null,
    decisionYear: number | null,
  ) {
    return components.map((component) => {
      const matchingType = this.componentTypes.find(
        (type) => type.code === component.noticeOfIntentDecisionComponentTypeCode,
      );
      return {
        uuid: component.uuid,
        decisionUuid: decisionUuid,
        code: component.noticeOfIntentDecisionComponentTypeCode,
        label:
          decisionNumber && decisionYear
            ? `#${decisionNumber}/${decisionYear} ${matchingType?.label}`
            : `Draft ${matchingType?.label}`,
        tempId: `${decisionUuid}_${component.noticeOfIntentDecisionComponentTypeCode}`,
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

  onValidate() {
    this.conditionComponents.forEach((component) => component.form.markAllAsTouched());
  }
}

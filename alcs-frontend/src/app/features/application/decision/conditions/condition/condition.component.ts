import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { ApplicationDecisionComponentToConditionLotService } from '../../../../../services/application/decision/application-decision-v2/application-decision-component-to-condition-lot/application-decision-component-to-condition-lot.service';
import { ApplicationDecisionConditionService } from '../../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';
import {
  ApplicationDecisionConditionToComponentPlanNumberDto,
  APPLICATION_DECISION_COMPONENT_TYPE,
  ApplicationDecisionComponentDto,
  UpdateApplicationDecisionConditionDto,
} from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import {
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_INCOMPLETE_LABEL,
} from '../../../../../shared/application-type-pill/application-type-pill.constants';
import {
  ApplicationDecisionConditionWithStatus,
  ConditionComponentLabels,
  CONDITION_STATUS,
} from '../conditions.component';

type Condition = ApplicationDecisionConditionWithStatus & {
  componentLabelsStr?: string;
  componentLabels?: ConditionComponentLabels[];
};

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.scss'],
})
export class ConditionComponent implements OnInit, AfterViewInit {
  @Input() condition!: Condition;
  @Input() isDraftDecision!: boolean;
  @Input() fileNumber!: string;

  incompleteLabel = DECISION_CONDITION_INCOMPLETE_LABEL;
  completeLabel = DECISION_CONDITION_COMPLETE_LABEL;

  CONDITION_STATUS = CONDITION_STATUS;

  isReadMoreClicked = false;
  isReadMoreVisible = false;
  conditionStatus: string = '';
  isRequireSurveyPlan = false;
  subdComponent?: ApplicationDecisionComponentDto;
  planNumbers: ApplicationDecisionConditionToComponentPlanNumberDto[] = [];

  constructor(
    private conditionService: ApplicationDecisionConditionService,
    private conditionLotService: ApplicationDecisionComponentToConditionLotService
  ) {}

  ngOnInit() {
    this.updateStatus();
    if (this.condition) {
      this.condition = {
        ...this.condition,
        componentLabelsStr: this.condition.conditionComponentsLabels?.flatMap((e) => e.label).join(';\n'),
      };

      this.isRequireSurveyPlan = this.condition.type?.code === 'RSPL';
      this.loadLots();
      this.loadPlanNumber();
    }
  }

  async loadLots() {
    if (this.condition.components) {
      const subdComponent = this.condition.components.find(
        (component) => component.applicationDecisionComponentTypeCode === APPLICATION_DECISION_COMPONENT_TYPE.SUBD
      );
      if (subdComponent && subdComponent.uuid) {
        const planNumbers = await this.conditionLotService.fetchConditionLots(this.condition.uuid, subdComponent.uuid);
        subdComponent.lots = subdComponent.lots
          ?.map((lot) => ({
            ...lot,
            uuid: lot.uuid,
            planNumbers:
              planNumbers.find((planNumber) => planNumber.componentLotUuid === lot.uuid)?.planNumbers ?? null,
          }))
          .sort((a, b) => a.index - b.index);
        this.subdComponent = subdComponent;
      }
    }
  }

  async loadPlanNumber() {
    const subdComponent = this.condition.components?.find(
      (component) => component.applicationDecisionComponentTypeCode === APPLICATION_DECISION_COMPONENT_TYPE.SUBD
    );
    if (
      this.condition.components &&
      this.condition.components.some(
        (component) => component.applicationDecisionComponentTypeCode !== APPLICATION_DECISION_COMPONENT_TYPE.SUBD
      ) &&
      this.isRequireSurveyPlan
    ) {
      const planNumbers = (await this.conditionService.fetchPlanNumbers(this.condition.uuid)).filter(
        (planNumber) => planNumber.applicationDecisionComponentUuid !== subdComponent?.uuid
      );

      this.planNumbers =
        this.condition.components
          ?.filter(
            (component) => component.applicationDecisionComponentTypeCode !== APPLICATION_DECISION_COMPONENT_TYPE.SUBD
          )
          .map(
            (component) =>
              ({
                applicationDecisionComponentUuid: component.uuid,
                applicationDecisionConditionUuid: this.condition.uuid,
                planNumbers: planNumbers.find(
                  (planNumber) => planNumber.applicationDecisionComponentUuid === component.uuid
                )?.planNumbers,
              } as ApplicationDecisionConditionToComponentPlanNumberDto)
          ) ?? [];
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => (this.isReadMoreVisible = this.checkIfReadMoreVisible()));
  }

  async onUpdateCondition(
    field: keyof UpdateApplicationDecisionConditionDto,
    value: string[] | string | number | null
  ) {
    const condition = this.condition;

    if (condition) {
      const update = await this.conditionService.update(condition.uuid, {
        [field]: value,
      });

      const labels = this.condition.componentLabelsStr;
      this.condition = { ...update, componentLabelsStr: labels } as Condition;

      this.updateStatus();
    }
  }

  onToggleReadMore() {
    this.isReadMoreClicked = !this.isReadMoreClicked;
  }

  isEllipsisActive(e: string): boolean {
    const el = document.getElementById(e);
    // + 2 required as adjustment to height
    return el ? el.clientHeight + 2 < el.scrollHeight : false;
  }

  checkIfReadMoreVisible(): boolean {
    return this.isReadMoreClicked || this.isEllipsisActive(this.condition.uuid + 'Description');
  }

  updateStatus() {
    const today = moment().startOf('day').toDate().getTime();

    if (this.condition.completionDate && this.condition.completionDate <= today) {
      this.conditionStatus = CONDITION_STATUS.COMPLETE;
    } else {
      this.conditionStatus = CONDITION_STATUS.INCOMPLETE;
    }
  }

  async savePlanNumbers(lotUuid: string, conditionUuid: string, planNumbers: string | null) {
    if (this.subdComponent && this.subdComponent.uuid && this.subdComponent?.lots) {
      await this.conditionLotService.update(lotUuid, conditionUuid, planNumbers);
    }
  }

  async updateConditionPlanNumbers(conditionUuid: string, componentUuid: string, $value: string | null) {
    if (this.isRequireSurveyPlan) {
      this.conditionService.updatePlanNumbers(conditionUuid, componentUuid, $value);
    }
  }

  getComponentLabel(componentUuid: string) {
    return this.condition.conditionComponentsLabels?.find((e) => e.componentUuid === componentUuid)?.label;
  }
}

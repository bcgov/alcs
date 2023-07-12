import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { ApplicationDecisionConditionService } from '../../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';
import { UpdateApplicationDecisionConditionDto } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import {
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_INCOMPLETE_LABEL,
  DECISION_CONDITION_SUPERSEDED_LABEL,
} from '../../../../../shared/application-type-pill/application-type-pill.constants';
import { ApplicationDecisionConditionWithStatus, CONDITION_STATUS } from '../conditions.component';

type Condition = ApplicationDecisionConditionWithStatus & {
  componentLabels?: string;
};

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.scss'],
})
export class ConditionComponent implements OnInit, AfterViewInit {
  @Input() condition!: Condition;
  @Input() isDraftDecision!: boolean;

  incompleteLabel = DECISION_CONDITION_INCOMPLETE_LABEL;
  completeLabel = DECISION_CONDITION_COMPLETE_LABEL;
  supersededLabel = DECISION_CONDITION_SUPERSEDED_LABEL;

  CONDITION_STATUS = CONDITION_STATUS;

  isReadMoreClicked = false;
  isReadMoreVisible = false;
  conditionStatus: string = '';

  constructor(private conditionService: ApplicationDecisionConditionService) {}

  ngOnInit() {
    this.updateStatus();
    if (this.condition) {
      this.condition = {
        ...this.condition,
        componentLabels: this.condition.conditionComponentsLabels?.join(';\n'),
      };
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

      const labels = this.condition.componentLabels;
      this.condition = { ...update, componentLabels: labels } as Condition;

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

    if (this.condition.supersededDate && this.condition.supersededDate <= today) {
      this.conditionStatus = CONDITION_STATUS.SUPERSEDED;
    } else if (this.condition.completionDate && this.condition.completionDate <= today) {
      this.conditionStatus = CONDITION_STATUS.COMPLETE;
    } else {
      this.conditionStatus = CONDITION_STATUS.INCOMPLETE;
    }
  }
}

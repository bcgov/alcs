import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { NoticeOfIntentDecisionConditionService } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { UpdateNoticeOfIntentDecisionConditionDto } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import {
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_INCOMPLETE_LABEL,
  DECISION_CONDITION_SUPERSEDED_LABEL,
} from '../../../../../shared/application-type-pill/application-type-pill.constants';
import { CONDITION_STATUS, ConditionComponentLabels, DecisionConditionWithStatus } from '../conditions.component';
import { environment } from '../../../../../../environments/environment';
import { DateType } from 'src/app/services/application/decision/application-decision-v2/application-decision-v2.dto';

type Condition = DecisionConditionWithStatus & {
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
  supersededLabel = DECISION_CONDITION_SUPERSEDED_LABEL;

  singleDateLabel = 'End Date';
  showSingleDateField = false;
  showAdmFeeField = false;
  showSecurityAmountField = false;
  singleDateFormated: string | undefined = undefined;

  CONDITION_STATUS = CONDITION_STATUS;

  isReadMoreClicked = false;
  isReadMoreVisible = false;
  conditionStatus: string = '';

  constructor(private conditionService: NoticeOfIntentDecisionConditionService) {}

  ngOnInit() {
    this.updateStatus();
    if (this.condition) {
      this.singleDateFormated = this.condition.singleDate
        ? moment(this.condition.singleDate).format(environment.dateFormat)
        : undefined;
      this.singleDateLabel = this.condition.type?.singleDateLabel ? this.condition.type?.singleDateLabel : 'End Date';
      this.showSingleDateField = this.condition.type?.dateType === DateType.SINGLE;
      this.showAdmFeeField = this.condition.type?.isAdministrativeFeeAmountChecked
        ? this.condition.type?.isAdministrativeFeeAmountChecked
        : false;
      this.showSecurityAmountField = this.condition.type?.isSecurityAmountChecked
        ? this.condition.type?.isSecurityAmountChecked
        : false;
      this.condition = {
        ...this.condition,
        componentLabelsStr: this.condition.conditionComponentsLabels?.flatMap((e) => e.label).join(';\n'),
      };
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => (this.isReadMoreVisible = this.checkIfReadMoreVisible()));
  }

  async onUpdateCondition(
    field: keyof UpdateNoticeOfIntentDecisionConditionDto,
    value: string[] | string | number | null,
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
}

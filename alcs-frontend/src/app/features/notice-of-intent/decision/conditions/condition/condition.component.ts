import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { NoticeOfIntentDecisionConditionService } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import {
  NoticeOfIntentDecisionConditionDateDto,
  UpdateNoticeOfIntentDecisionConditionDto,
} from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import {
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_ONGOING_LABEL,
  DECISION_CONDITION_PASTDUE_LABEL,
  DECISION_CONDITION_PENDING_LABEL,
  DECISION_CONDITION_EXPIRED_LABEL,
} from '../../../../../shared/application-type-pill/application-type-pill.constants';
import { CONDITION_STATUS, ConditionComponentLabels, DecisionConditionWithStatus } from '../conditions.component';
import { environment } from '../../../../../../environments/environment';
import { DateType } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { countToString } from '../../../../../shared/utils/count-to-string';

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
  @Input() index!: number;

  DateType = DateType;

  dates: NoticeOfIntentDecisionConditionDateDto[] = [];

  statusLabel = DECISION_CONDITION_ONGOING_LABEL;

  singleDateLabel = 'End Date';
  showSingleDateField = false;
  showAdmFeeField = false;
  showSecurityAmountField = false;
  singleDateFormated: string | undefined = undefined;

  CONDITION_STATUS = CONDITION_STATUS;

  isReadMoreClicked = false;
  isReadMoreVisible = false;
  conditionStatus: string = '';
  stringIndex: string = '';
  today!: number;

  constructor(private conditionService: NoticeOfIntentDecisionConditionService) {
    this.today = moment().startOf('day').toDate().getTime();
  }

  async ngOnInit() {
    this.stringIndex = countToString(this.index);
    if (this.condition) {
      await this.fetchDates(this.condition.uuid);
      this.calcStatus();

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

  calcStatus() {
    if (this.dates && this.dates.length > 0) {
      if (this.dates.every((date) => date.completedDate && date.completedDate <= this.today)) {
        this.condition.status = CONDITION_STATUS.COMPLETE;
      } else {
        if (this.checkExpired()) {
          this.condition.status = CONDITION_STATUS.EXPIRED;
        } else if (this.checkPending()) {
          this.condition.status = CONDITION_STATUS.PASTDUE;
        } else if (this.checkPastDue()) {
          this.condition.status = CONDITION_STATUS.PENDING;
        }
      }
    } else {
      this.condition.status = CONDITION_STATUS.ONGOING;
    }
    this.setPillLabel();
  }

  private checkExpired(): boolean {
    const expiredDates = this.dates.filter((d) => {
      if (d.date) {
        return d.date <= this.today && !d.completedDate;
      }
      return false;
    });
    return this.condition.type?.singleDateLabel === 'End Date' && expiredDates.length > 0;
  }

  private checkPastDue(): boolean {
    const expiredDates = this.dates.filter((d) => {
      if (d.date) {
        return d.date <= this.today && !d.completedDate;
      }
      return false;
    });
    return this.condition.type?.singleDateLabel === 'Due Date' && expiredDates.length > 0;
  }

  private checkPending(): boolean {
    const dueDates = this.dates.filter((d) => {
      if (d.date) {
        return d.date >= this.today && !d.completedDate;
      }
      return false;
    });
    return dueDates.length > 0;
  }

  private setPillLabel() {
    switch (this.condition.status) {
      case CONDITION_STATUS.ONGOING:
        this.statusLabel = DECISION_CONDITION_ONGOING_LABEL;
        break;
      case CONDITION_STATUS.COMPLETE:
          this.statusLabel = DECISION_CONDITION_COMPLETE_LABEL;
          break;
      case CONDITION_STATUS.PASTDUE:
        this.statusLabel = DECISION_CONDITION_PASTDUE_LABEL;
        break;
      case CONDITION_STATUS.PENDING:
        this.statusLabel = DECISION_CONDITION_PENDING_LABEL;
        break;
      case CONDITION_STATUS.EXPIRED:
        this.statusLabel = DECISION_CONDITION_EXPIRED_LABEL;
        break;
      default:
        this.statusLabel = DECISION_CONDITION_ONGOING_LABEL;
        break;
    }
  }

  async fetchDates(uuid: string | undefined) {
    if (!uuid) {
      return;
    }

    this.dates = await this.conditionService.getDates(uuid);

    this.singleDateFormated =
      this.dates[0] && this.dates[0].date ? moment(this.dates[0].date).format(environment.dateFormat) : undefined;
  }
}

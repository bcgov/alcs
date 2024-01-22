import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import {
  NoticeOfIntentDecisionCodesDto,
  NoticeOfIntentDecisionConditionDto,
  NoticeOfIntentDecisionWithLinkedResolutionDto,
} from '../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDetailService } from '../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import {
  DRAFT_DECISION_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  RELEASED_DECISION_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';

export type ConditionComponentLabels = {
  label: string[];
  componentUuid: string;
  conditionUuid: string;
};

export type DecisionConditionWithStatus = NoticeOfIntentDecisionConditionDto & {
  conditionComponentsLabels?: ConditionComponentLabels[];
  status: string;
};

export type DecisionWithConditionComponentLabels = NoticeOfIntentDecisionWithLinkedResolutionDto & {
  conditions: DecisionConditionWithStatus[];
};

export const CONDITION_STATUS = {
  INCOMPLETE: 'incomplete',
  COMPLETE: 'complete',
  SUPERSEDED: 'superseded',
};

@Component({
  selector: 'app-noi-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class ConditionsComponent implements OnInit {
  $destroy = new Subject<void>();

  decisionUuid: string = '';
  fileNumber: string = '';
  decisions: DecisionWithConditionComponentLabels[] = [];
  decision!: DecisionWithConditionComponentLabels;
  noticeOfIntent: NoticeOfIntentDto | undefined;
  codes!: NoticeOfIntentDecisionCodesDto;
  today!: number;

  dratDecisionLabel = DRAFT_DECISION_TYPE_LABEL;
  releasedDecisionLabel = RELEASED_DECISION_TYPE_LABEL;
  modificationLabel = MODIFICATION_TYPE_LABEL;

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    private activatedRouter: ActivatedRoute
  ) {
    this.today = moment().startOf('day').toDate().getTime();
  }

  ngOnInit(): void {
    this.fileNumber = this.activatedRouter.parent?.parent?.snapshot.paramMap.get('fileNumber')!;
    this.decisionUuid = this.activatedRouter.snapshot.paramMap.get('uuid')!;

    this.noticeOfIntentDetailService.$noticeOfIntent.pipe(takeUntil(this.$destroy)).subscribe((noticeOfIntent) => {
      if (noticeOfIntent) {
        this.noticeOfIntent = noticeOfIntent;
        this.loadDecisions(noticeOfIntent.fileNumber);
      }
    });
  }

  async loadDecisions(fileNumber: string) {
    this.codes = await this.decisionService.fetchCodes();
    this.decisionService.$decisions.pipe(takeUntil(this.$destroy)).subscribe((decisions) => {
      this.decisions = decisions.map((decision) => {
        if (decision.uuid === this.decisionUuid) {
          const conditions = this.mapConditions(decision, decisions);

          this.sortConditions(decision, conditions);

          this.decision = decision as DecisionWithConditionComponentLabels;
        }

        return decision as DecisionWithConditionComponentLabels;
      });
    });

    this.decisionService.loadDecisions(fileNumber);
  }

  private sortConditions(
    decision: NoticeOfIntentDecisionWithLinkedResolutionDto,
    conditions: DecisionConditionWithStatus[]
  ) {
    decision.conditions = conditions.sort((a, b) => {
      const order = [CONDITION_STATUS.INCOMPLETE, CONDITION_STATUS.COMPLETE, CONDITION_STATUS.SUPERSEDED];
      if (a.status === b.status) {
        if (a.type && b.type) {
          return a.type?.label.localeCompare(b.type.label);
        } else {
          return -1;
        }
      } else {
        return order.indexOf(a.status) - order.indexOf(b.status);
      }
    });
  }

  private mapConditions(
    decision: NoticeOfIntentDecisionWithLinkedResolutionDto,
    decisions: NoticeOfIntentDecisionWithLinkedResolutionDto[]
  ) {
    return decision.conditions.map((condition) => {
      const status = this.getStatus(condition, decision);

      return {
        ...condition,
        status,
        conditionComponentsLabels: condition.components?.map((c) => {
          const matchingType = this.codes.decisionComponentTypes.find(
            (type) => type.code === c.noticeOfIntentDecisionComponentTypeCode
          );

          const componentsDecision = decisions.find((d) => d.uuid === c.noticeOfIntentDecisionUuid);

          if (componentsDecision) {
            decision = componentsDecision;
          }

          const label =
            decision.resolutionNumber && decision.resolutionYear
              ? `#${decision.resolutionNumber}/${decision.resolutionYear} ${matchingType?.label}`
              : `Draft ${matchingType?.label}`;

          return { label, conditionUuid: condition.uuid, componentUuid: c.uuid };
        }),
      } as DecisionConditionWithStatus;
    });
  }

  private getStatus(
    condition: NoticeOfIntentDecisionConditionDto,
    decision: NoticeOfIntentDecisionWithLinkedResolutionDto
  ) {
    let status = '';
    if (condition.supersededDate && condition.supersededDate <= this.today) {
      status = CONDITION_STATUS.SUPERSEDED;
    } else if (condition.completionDate && condition.completionDate <= this.today) {
      status = CONDITION_STATUS.COMPLETE;
    } else if (!decision.isDraft) {
      status = CONDITION_STATUS.INCOMPLETE;
    } else {
      status = '';
    }
    return status;
  }
}

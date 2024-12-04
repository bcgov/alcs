import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { from, map, Subject, switchMap, takeUntil } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import {
  NoticeOfIntentDecisionCodesDto,
  NoticeOfIntentDecisionConditionDateDto,
  NoticeOfIntentDecisionConditionDto,
  NoticeOfIntentDecisionWithLinkedResolutionDto,
} from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { NoticeOfIntentDetailService } from '../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import {
  DRAFT_DECISION_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  RELEASED_DECISION_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';
import { NoticeOfIntentDecisionConditionService } from 'src/app/services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';

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
    private conditionService: NoticeOfIntentDecisionConditionService,
    private activatedRouter: ActivatedRoute,
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
    this.decisionService.$decisions
      .pipe(takeUntil(this.$destroy))
      .pipe(
        switchMap((decisions) =>
          from(this.getDatesByConditionUuid(decisions)).pipe(
            map((datesByConditionUuid) => ({
              decisions,
              datesByConditionUuid,
            })),
          ),
        ),
      )
      .subscribe(({ decisions, datesByConditionUuid }) => {
        this.decisions = decisions.map((decision) => {
          if (decision.uuid === this.decisionUuid) {
            const conditions = this.mapConditions(decision, datesByConditionUuid, decisions);

            this.sortConditions(decision, conditions);

            this.decision = decision as DecisionWithConditionComponentLabels;
          }

          return decision as DecisionWithConditionComponentLabels;
        });
      });

    this.decisionService.loadDecisions(fileNumber);
  }

  private async getDatesByConditionUuid(
    decisions: NoticeOfIntentDecisionWithLinkedResolutionDto[],
  ): Promise<Map<string, NoticeOfIntentDecisionConditionDateDto[]>> {
    let datesByConditionUuid = new Map<string, NoticeOfIntentDecisionConditionDateDto[]>();

    for (const decision of decisions) {
      for (const condition of decision.conditions) {
        datesByConditionUuid.set(condition.uuid, await this.conditionService.getDates(condition.uuid));
      }
    }

    return datesByConditionUuid;
  }

  private sortConditions(
    decision: NoticeOfIntentDecisionWithLinkedResolutionDto,
    conditions: DecisionConditionWithStatus[],
  ) {
    decision.conditions = conditions.sort((a, b) => {
      const order = [CONDITION_STATUS.INCOMPLETE, CONDITION_STATUS.COMPLETE];
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
    datesByConditionUuid: Map<string, NoticeOfIntentDecisionConditionDateDto[]>,
    decisions: NoticeOfIntentDecisionWithLinkedResolutionDto[],
  ) {
    return decision.conditions.map((condition) => {
      const dates = datesByConditionUuid.get(condition.uuid) ?? [];
      const status = this.getStatus(dates, decision);

      return {
        ...condition,
        status,
        conditionComponentsLabels: condition.components?.map((c) => {
          const matchingType = this.codes.decisionComponentTypes.find(
            (type) => type.code === c.noticeOfIntentDecisionComponentTypeCode,
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
    dates: NoticeOfIntentDecisionConditionDateDto[],
    decision: NoticeOfIntentDecisionWithLinkedResolutionDto,
  ) {
    let status = '';
    status = CONDITION_STATUS.COMPLETE;
    if (dates.length > 0 && dates.every((date) => date.completedDate && date.completedDate <= this.today)) {
      status = CONDITION_STATUS.COMPLETE;
    } else if (decision.isDraft === false) {
      status = CONDITION_STATUS.INCOMPLETE;
    } else {
      status = '';
    }
    return status;
  }
}

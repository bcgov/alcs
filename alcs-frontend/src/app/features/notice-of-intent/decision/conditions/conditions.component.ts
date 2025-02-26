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
import { NoticeOfIntentDecisionConditionService } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { MatDialog } from '@angular/material/dialog';
import { ConditionCardDialogComponent } from './condition-card-dialog/condition-card-dialog.component';
import { NoticeOfIntentDecisionConditionCardService } from '../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.service';
import { MatChipListboxChange } from '@angular/material/chips';

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
  COMPLETED: 'completed',
  ONGOING: 'ongoing',
  PENDING: 'pending',
  PASTDUE: 'pastdue',
  EXPIRED: 'expired',
};

@Component({
  selector: 'app-noi-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class ConditionsComponent implements OnInit {
  conditionLabelsByStatus: Record<keyof typeof CONDITION_STATUS, string> = {
    COMPLETED: 'Complete',
    ONGOING: 'Ongoing',
    PENDING: 'Pending',
    PASTDUE: 'Past Due',
    EXPIRED: 'Expired',
  };

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

  conditionFilters: string[] = [];

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    private conditionService: NoticeOfIntentDecisionConditionService,
    private conditionCardService: NoticeOfIntentDecisionConditionCardService,
    private activatedRouter: ActivatedRoute,
    private dialog: MatDialog,
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
      .subscribe(async ({ decisions }) => {
        this.decisions = await Promise.all(
          decisions.map(async (decision) => {
            if (decision.uuid === this.decisionUuid) {
              const conditions = await this.mapConditions(decision, decisions);
              this.sortConditions(decision, conditions);

              this.decision = decision as DecisionWithConditionComponentLabels;
            }

            return decision as DecisionWithConditionComponentLabels;
          }),
        );
      });

    this.decisionService.loadDecisions(fileNumber);
  }

  private async getDatesByConditionUuid(
    decisions: NoticeOfIntentDecisionWithLinkedResolutionDto[],
  ): Promise<Map<string, NoticeOfIntentDecisionConditionDateDto[]>> {
    let datesByConditionUuid = new Map<string, NoticeOfIntentDecisionConditionDateDto[]>();

    for (const decision of decisions) {
      for (const condition of decision.conditions) {
        datesByConditionUuid.set(condition.uuid, condition.dates !== undefined ? condition.dates : []);
      }
    }

    return datesByConditionUuid;
  }

  private sortConditions(
    decision: NoticeOfIntentDecisionWithLinkedResolutionDto,
    conditions: DecisionConditionWithStatus[],
  ) {
    decision.conditions = conditions.sort((a, b) => {
      const order = [
        CONDITION_STATUS.ONGOING,
        CONDITION_STATUS.COMPLETED,
        CONDITION_STATUS.PASTDUE,
        CONDITION_STATUS.EXPIRED,
      ];
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

  private async mapConditions(
    decision: NoticeOfIntentDecisionWithLinkedResolutionDto,
    decisions: NoticeOfIntentDecisionWithLinkedResolutionDto[],
  ) {
    return Promise.all(
      decision.conditions.map(async (condition) => {
        const conditionStatus = await this.decisionService.getStatus(condition.uuid);
        return {
          ...condition,
          status: conditionStatus.status,
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
      }),
    );
  }

  openConditionCardDialog(): void {
    const dialogRef = this.dialog.open(ConditionCardDialogComponent, {
      minWidth: '800px',
      maxWidth: '1100px',
      maxHeight: '80vh',
      data: {
        conditions: this.decision.conditions.map((condition, index) => ({
          condition: condition,
          index: index,
        })),
        decision: this.decision.uuid,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.action === 'save' && result.result === true) {
          this.loadDecisions(this.fileNumber);
          this.conditionCardService.fetchByNoticeOfIntentFileNumber(this.fileNumber);
        }
      }
    });
  }

  onConditionFilterChange(change: MatChipListboxChange) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement?.blur();
    }

    this.conditionFilters = change.value;
  }

  filterConditions(conditions: DecisionConditionWithStatus[]): DecisionConditionWithStatus[] {
    if (this.conditionFilters.length < 1) {
      return conditions;
    }

    return conditions.filter((condition) => this.conditionFilters.includes(condition.status));
  }

  onStatusChange(condition: DecisionConditionWithStatus, newStatus: string) {
    condition.status = newStatus;
  }
}

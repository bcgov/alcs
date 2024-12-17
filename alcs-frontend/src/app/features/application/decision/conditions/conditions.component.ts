import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { from, map, Subject, switchMap, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import {
  ApplicationDecisionConditionDto,
  ApplicationDecisionDto,
  ApplicationDecisionWithLinkedResolutionDto,
  ApplicationDecisionCodesDto,
  ApplicationDecisionConditionDateDto,
} from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import {
  DRAFT_DECISION_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  RECON_TYPE_LABEL,
  RELEASED_DECISION_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ApplicationDecisionConditionService } from '../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';

export type ConditionComponentLabels = {
  label: string[];
  componentUuid: string;
  conditionUuid: string;
};

export type ApplicationDecisionConditionWithStatus = ApplicationDecisionConditionDto & {
  conditionComponentsLabels?: ConditionComponentLabels[];
  status: string;
};

export type ApplicationDecisionWithConditionComponentLabels = ApplicationDecisionWithLinkedResolutionDto & {
  conditions: ApplicationDecisionConditionWithStatus[];
};

export const CONDITION_STATUS = {
  COMPLETE: 'COMPLETE',
  ONGOING: 'ONGOING',
  PENDING: 'PENDING',
  PASTDUE: 'PASTDUE',
  EXPIRED: 'EXPIRED',
};

@Component({
  selector: 'app-app-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class ConditionsComponent implements OnInit {
  $destroy = new Subject<void>();

  decisionUuid: string = '';
  fileNumber: string = '';
  decisions: ApplicationDecisionWithConditionComponentLabels[] = [];
  decision!: ApplicationDecisionWithConditionComponentLabels;
  conditionDecision!: ApplicationDecisionDto;
  application: ApplicationDto | undefined;
  codes!: ApplicationDecisionCodesDto;
  today!: number;

  dratDecisionLabel = DRAFT_DECISION_TYPE_LABEL;
  releasedDecisionLabel = RELEASED_DECISION_TYPE_LABEL;
  reconLabel = RECON_TYPE_LABEL;
  modificationLabel = MODIFICATION_TYPE_LABEL;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private decisionService: ApplicationDecisionV2Service,
    private conditionService: ApplicationDecisionConditionService,
    private activatedRouter: ActivatedRoute,
  ) {
    this.today = moment().startOf('day').toDate().getTime();
  }

  ngOnInit(): void {
    this.fileNumber = this.activatedRouter.parent?.parent?.snapshot.paramMap.get('fileNumber')!;
    this.decisionUuid = this.activatedRouter.snapshot.paramMap.get('uuid')!;

    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
        this.loadDecisions(application.fileNumber);
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

              this.decision = decision as ApplicationDecisionWithConditionComponentLabels;
            }

            return decision as ApplicationDecisionWithConditionComponentLabels;
          }),
        );
      });

    this.decisionService.loadDecisions(fileNumber);
  }

  private async getDatesByConditionUuid(
    decisions: ApplicationDecisionWithLinkedResolutionDto[],
  ): Promise<Map<string, ApplicationDecisionConditionDateDto[]>> {
    let datesByConditionUuid = new Map<string, ApplicationDecisionConditionDateDto[]>();

    for (const decision of decisions) {
      for (const condition of decision.conditions) {
        // datesByConditionUuid.set(condition.uuid, await this.conditionService.getDates(condition.uuid));
        datesByConditionUuid.set(condition.uuid, condition.dates !== undefined ? condition.dates : []);
      }
    }

    return datesByConditionUuid;
  }

  private sortConditions(
    decision: ApplicationDecisionWithLinkedResolutionDto,
    conditions: ApplicationDecisionConditionWithStatus[],
  ) {
    decision.conditions = conditions.sort((a, b) => {
      const order = [
        CONDITION_STATUS.ONGOING,
        CONDITION_STATUS.COMPLETE,
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
    decision: ApplicationDecisionWithLinkedResolutionDto,
    decisions: ApplicationDecisionWithLinkedResolutionDto[],
  ) {
    return Promise.all(
      decision.conditions.map(async (condition) => {
        const conditionStatus = await this.decisionService.getStatus(condition.uuid);
        return {
          ...condition,
          status: conditionStatus.status,
          conditionComponentsLabels: condition.components?.map((c) => {
            const matchingType = this.codes.decisionComponentTypes.find(
              (type) => type.code === c.applicationDecisionComponentTypeCode,
            );

            const componentsDecision = decisions.find((d) => d.uuid === c.applicationDecisionUuid);

            if (componentsDecision) {
              decision = componentsDecision;
            }

            const label =
              decision.resolutionNumber && decision.resolutionYear
                ? `#${decision.resolutionNumber}/${decision.resolutionYear} ${matchingType?.label}`
                : `Draft ${matchingType?.label}`;

            return { label, conditionUuid: condition.uuid, componentUuid: c.uuid };
          }),
        } as ApplicationDecisionConditionWithStatus;
      }),
    );
  }
}

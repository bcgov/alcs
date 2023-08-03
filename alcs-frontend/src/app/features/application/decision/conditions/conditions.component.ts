import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import {
  ApplicationDecisionConditionDto,
  ApplicationDecisionDto,
  ApplicationDecisionWithLinkedResolutionDto,
  DecisionCodesDto,
} from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import {
  DRAFT_DECISION_TYPE_LABEL,
  MODIFICATION_TYPE_LABEL,
  RECON_TYPE_LABEL,
  RELEASED_DECISION_TYPE_LABEL,
} from '../../../../shared/application-type-pill/application-type-pill.constants';

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
  INCOMPLETE: 'incomplete',
  COMPLETE: 'complete',
  SUPERSEDED: 'superseded',
};

@Component({
  selector: 'app-conditions',
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
  codes!: DecisionCodesDto;
  today!: number;

  dratDecisionLabel = DRAFT_DECISION_TYPE_LABEL;
  releasedDecisionLabel = RELEASED_DECISION_TYPE_LABEL;
  reconLabel = RECON_TYPE_LABEL;
  modificationLabel = MODIFICATION_TYPE_LABEL;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private decisionService: ApplicationDecisionV2Service,
    private activatedRouter: ActivatedRoute
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
    this.decisionService.$decisions.pipe(takeUntil(this.$destroy)).subscribe((decisions) => {
      this.decisions = decisions.map((decision) => {
        if (decision.uuid === this.decisionUuid) {
          const conditions = this.mapConditions(decision, decisions);

          this.sortConditions(decision, conditions);

          this.decision = decision as ApplicationDecisionWithConditionComponentLabels;
        }

        return decision as ApplicationDecisionWithConditionComponentLabels;
      });
    });

    this.decisionService.loadDecisions(fileNumber);
  }

  private sortConditions(
    decision: ApplicationDecisionWithLinkedResolutionDto,
    conditions: ApplicationDecisionConditionWithStatus[]
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
    decision: ApplicationDecisionWithLinkedResolutionDto,
    decisions: ApplicationDecisionWithLinkedResolutionDto[]
  ) {
    return decision.conditions.map((condition) => {
      const status = this.getStatus(condition, decision);

      return {
        ...condition,
        status,
        conditionComponentsLabels: condition.components?.map((c) => {
          const matchingType = this.codes.decisionComponentTypes.find(
            (type) => type.code === c.applicationDecisionComponentTypeCode
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
    });
  }

  private getStatus(condition: ApplicationDecisionConditionDto, decision: ApplicationDecisionWithLinkedResolutionDto) {
    let status = '';
    if (condition.supersededDate && condition.supersededDate <= this.today) {
      status = CONDITION_STATUS.SUPERSEDED;
    } else if (condition.completionDate && condition.completionDate <= this.today) {
      status = CONDITION_STATUS.COMPLETE;
    } else if (decision.isDraft === false) {
      status = CONDITION_STATUS.INCOMPLETE;
    } else {
      status = '';
    }
    return status;
  }
}

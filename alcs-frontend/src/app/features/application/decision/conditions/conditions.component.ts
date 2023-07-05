import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import {
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

@Component({
  selector: 'app-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class ConditionsComponent implements OnInit {
  $destroy = new Subject<void>();

  decisionUuid: string = '';
  fileNumber: string = '';
  decisions: ApplicationDecisionWithLinkedResolutionDto[] = [];
  decision!: ApplicationDecisionWithLinkedResolutionDto;
  conditionDecision!: ApplicationDecisionDto;
  application: ApplicationDto | undefined;
  codes!: DecisionCodesDto;

  dratDecisionLabel = DRAFT_DECISION_TYPE_LABEL;
  releasedDecisionLabel = RELEASED_DECISION_TYPE_LABEL;
  reconLabel = RECON_TYPE_LABEL;
  modificationLabel = MODIFICATION_TYPE_LABEL;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private decisionService: ApplicationDecisionV2Service,
    private activatedRouter: ActivatedRoute
  ) {}

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
      this.decisions = decisions.map((decision, ind) => {
        if (decision.uuid === this.decisionUuid) {
          const conditions = decision.conditions.map((e) => {
            return {
              ...e,
              conditionComponentsLabels: e.components?.map((c) => {
                const matchingType = this.codes.decisionComponentTypes.find(
                  (type) => type.code === c.applicationDecisionComponentTypeCode
                );

                const label =
                  decision.resolutionNumber && decision.resolutionYear
                    ? `#${decision.resolutionNumber}/${decision.resolutionYear} ${matchingType?.label}`
                    : `Draft ${matchingType?.label}`;

                return label;
              }),
            };
          });

          decision.conditions = conditions.sort((a, b) => {
            if (a.completionDate && !b.completionDate) {
              return 1;
            } else if (!a.completionDate && b.completionDate) {
              return -1;
            } else if (!a.completionDate && !b.completionDate && !a.supersededDate && !b.supersededDate) {
              return 0;
            } else if (!a.completionDate && !b.completionDate && a.supersededDate && !b.supersededDate) {
              return 1;
            } else if (!a.completionDate && !b.completionDate && !a.supersededDate && b.supersededDate) {
              return -1;
            }

            return a.type!.label.localeCompare(b.type!.label);
          });

          this.decision = decision;
        }

        return decision;
      });
    });

    this.decisionService.loadDecisions(fileNumber);
  }
}

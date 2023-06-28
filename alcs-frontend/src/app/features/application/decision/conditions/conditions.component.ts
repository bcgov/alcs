import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ApplicationDecisionDto } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { DRAFT_DECISION_TYPE_LABEL, RELEASED_DECISION_TYPE_LABEL } from '../../../../shared/application-type-pill/application-type-pill.constants';

@Component({
  selector: 'app-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class ConditionsComponent implements OnInit {
  $destroy = new Subject<void>();

  fileNumber: string = '';
  decisions: ApplicationDecisionDto[] = [];
  application: ApplicationDto | undefined;

  dratDecisionLabel = DRAFT_DECISION_TYPE_LABEL;
  releasedDecisionLabel = RELEASED_DECISION_TYPE_LABEL;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private decisionService: ApplicationDecisionV2Service
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit')
    this.applicationDetailService.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.application = application;
        this.loadDecisions(application.fileNumber);
      }
    });
  }

  async loadDecisions(fileNumber: string) {
    this.decisionService.$decisions.pipe(takeUntil(this.$destroy)).subscribe((decisions) => {
      this.decisions = decisions.map((decision) => ({
        ...decision,
        // reconsideredByResolutions: decision.reconsideredBy?.flatMap((r) => r.linkedResolutions) || [],
        // modifiedByResolutions: decision.modifiedBy?.flatMap((r) => r.linkedResolutions) || [],
      }));
    });

    this.decisionService.loadDecisions(fileNumber);
  }
}

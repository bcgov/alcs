import { Component } from '@angular/core';
import { ApplicationDecisionConditionTypesService } from '../../../services/application/application-decision-condition-types/application-decision-condition-types.service';
import { NoticeofIntentDecisionConditionTypesService } from '../../../services/notice-of-intent/notice-of-intent-decision-condition-types/notice-of-intent-decision-condition-types.service';
import { NoticeOfIntentDecisionConditionService } from '../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { ApplicationDecisionConditionService } from '../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';

@Component({
    selector: 'app-decision-condition-container',
    templateUrl: './decision-condition-container.component.html',
    styleUrls: ['./decision-condition-container.component.scss'],
    standalone: false
})
export class DecisionConditionContainerComponent {
  applicationService: ApplicationDecisionConditionTypesService;
  applicationConditionService: ApplicationDecisionConditionService;
  noiService: NoticeofIntentDecisionConditionTypesService;
  noiConditionService: NoticeOfIntentDecisionConditionService;

  constructor(
    private aplicationDecisionConditionTypesService: ApplicationDecisionConditionTypesService,
    private aplicationDecisionConditionService: ApplicationDecisionConditionService,
    private noiDecisionConditionTypesService: NoticeofIntentDecisionConditionTypesService,
    private noiDecisionConditionService: NoticeOfIntentDecisionConditionService,
  ) {
    this.applicationService = this.aplicationDecisionConditionTypesService;
    this.applicationConditionService = this.aplicationDecisionConditionService;
    this.noiService = this.noiDecisionConditionTypesService;
    this.noiConditionService = this.noiDecisionConditionService;
  }
}

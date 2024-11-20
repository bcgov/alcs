import { Component } from '@angular/core';
import { ApplicationDecisionConditionTypesService } from '../../../services/application/application-decision-condition-types/application-decision-condition-types.service';
import { NoticeofIntentDecisionConditionTypesService } from '../../../services/notice-of-intent/notice-of-intent-decision-condition-types/notice-of-intent-decision-condition-types.service';

@Component({
  selector: 'app-decision-condition-container',
  templateUrl: './decision-condition-container.component.html',
  styleUrls: ['./decision-condition-container.component.scss'],
})
export class DecisionConditionContainerComponent {

  applicationService: ApplicationDecisionConditionTypesService;
  noiService: NoticeofIntentDecisionConditionTypesService;

  constructor(
    private aplicationDecisionConditionTypesService: ApplicationDecisionConditionTypesService,
    private noiDecisionConditionTypesService: NoticeofIntentDecisionConditionTypesService,
  ) {
    this.applicationService = this.aplicationDecisionConditionTypesService;
    this.noiService = this.noiDecisionConditionTypesService;
  }
}

import { NoticeofIntentDecisionConditionTypesService } from '../../../services/notice-of-intent/notice-of-intent-decision-condition-types/notice-of-intent-decision-condition-types.service';
import { ApplicationDecisionConditionTypesService } from '../../../services/application/application-decision-condition-types/application-decision-condition-types.service';
import { ApplicationDecisionConditionTypeDto } from '../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionConditionService } from '../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';
import { NoticeOfIntentDecisionConditionService } from '../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';

export interface DecisionDialogDataInterface {
  service: ApplicationDecisionConditionTypesService | NoticeofIntentDecisionConditionTypesService;
  conditionService: ApplicationDecisionConditionService | NoticeOfIntentDecisionConditionService;
  content: ApplicationDecisionConditionTypeDto;
}

import { NoticeofIntentDecisionConditionTypesService } from "../../../services/notice-of-intent/notice-of-intent-decision-condition-types/notice-of-intent-decision-condition-types.service";
import { ApplicationDecisionConditionTypesService } from "../../../services/application/application-decision-condition-types/application-decision-condition-types.service";
import { ApplicationDecisionConditionTypeDto } from "../../../services/application/decision/application-decision-v2/application-decision-v2.dto";

export interface DecisionDialogDataInterface {
  service: ApplicationDecisionConditionTypesService | NoticeofIntentDecisionConditionTypesService;
  content: ApplicationDecisionConditionTypeDto;
}

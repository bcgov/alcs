import moment from 'moment-timezone';
import { ApplicationDecisionConditionDto } from "../../services/application/decision/application-decision-v2/application-decision-v2.dto";
import { NoticeOfIntentDecisionConditionDto } from "../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto";
import { ApplicationDecisionStatus } from '../../services/application/decision/application-decision-v2/application-condition-status.dto';

export type ApplicationConditionWithStatus = ApplicationDecisionConditionDto & {
  conditionStatus: ApplicationDecisionStatus;
}

export type NoticeOfIntentConditionWithStatus = NoticeOfIntentDecisionConditionDto & {
  conditionStatus: ApplicationDecisionStatus;
}

export function getEndDate(uuid: string | undefined, conditions: Record<string, ApplicationConditionWithStatus[] | NoticeOfIntentConditionWithStatus[]>) {
  const dates = uuid && conditions[uuid] ? 
  conditions[uuid].filter((x) => x.type?.code === 'UEND')
    .map((x) => x.dates?.map((x) => x.date))
  : [];
  if (dates.length === 0) {
    return null;
  }
  const reducedDates = dates
  .reduce((pre, cur) => pre?.concat(cur))
    ?.filter((x) => x !== null)
    .sort().reverse();
  const lastDate = reducedDates && reducedDates.length > 0 ? reducedDates[0] : null;
  return lastDate ? moment(lastDate).format('YYYY-MMM-DD') : null;
}

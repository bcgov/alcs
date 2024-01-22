import { AutoMap } from 'automapper-classes';
import { LinkedResolutionDto } from '../../../alcs/application-decision/application-decision-v1/application-decision/application-decision.dto';
import {
  NoticeOfIntentDecisionDocumentDto,
  NoticeOfIntentDecisionOutcomeCodeDto,
} from '../../../alcs/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDocumentDto } from '../../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.dto';

export class NoticeOfIntentPortalDecisionDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  date: number;

  @AutoMap(() => NoticeOfIntentDecisionOutcomeCodeDto)
  outcome: NoticeOfIntentDecisionOutcomeCodeDto;

  @AutoMap(() => String)
  decisionDescription: string;

  @AutoMap(() => String)
  resolutionNumber: number;

  @AutoMap(() => String)
  resolutionYear: number;

  @AutoMap(() => [NoticeOfIntentDecisionDocumentDto])
  documents: NoticeOfIntentDocumentDto[];

  @AutoMap(() => Boolean)
  isSubjectToConditions: boolean;

  modifies?: LinkedResolutionDto;
}

import { AutoMap } from 'automapper-classes';
import {
  ApplicationDecisionOutcomeCodeDto,
  DecisionDocumentDto,
  LinkedResolutionDto,
} from '../../../alcs/application-decision/application-decision-v2/application-decision/application-decision.dto';

export class ApplicationPortalDecisionDto {
  @AutoMap()
  uuid: string;

  date: number;

  @AutoMap(() => ApplicationDecisionOutcomeCodeDto)
  outcome: ApplicationDecisionOutcomeCodeDto;

  @AutoMap(() => String)
  decisionDescription: string;

  @AutoMap(() => String)
  resolutionNumber: number;

  @AutoMap(() => String)
  resolutionYear: number;

  @AutoMap(() => [DecisionDocumentDto])
  documents: DecisionDocumentDto[];

  @AutoMap(() => Boolean)
  isSubjectToConditions: boolean;

  reconsiders?: LinkedResolutionDto;
  modifies?: LinkedResolutionDto;
}

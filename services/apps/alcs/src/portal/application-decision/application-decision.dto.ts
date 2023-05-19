import { AutoMap } from '@automapper/classes';
import {
  DecisionDocumentDto,
  LinkedResolutionDto,
} from '../../alcs/decision/decision-v1/application-decision/application-decision.dto';
import { DecisionOutcomeCodeDto } from '../../alcs/decision/decision-v2/application-decision/application-decision.dto';

export class PortalDecisionDto {
  @AutoMap()
  uuid: string;

  @AutoMap()
  date: number;

  @AutoMap(() => DecisionOutcomeCodeDto)
  outcome: DecisionOutcomeCodeDto;

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

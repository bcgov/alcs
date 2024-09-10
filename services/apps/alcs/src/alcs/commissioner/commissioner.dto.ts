import { AutoMap } from 'automapper-classes';
import { ApplicationReconsiderationDto } from '../application-decision/application-reconsideration/application-reconsideration.dto';
import { LocalGovernmentDto } from '../local-government/local-government.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { PlanningReviewTypeDto } from '../planning-review/planning-review.dto';
import {
  ApplicationDecisionOutcomeCodeDto,
  DecisionDocumentDto,
} from '../application-decision/application-decision-v2/application-decision/application-decision.dto';
import { LinkedResolutionDto } from '../notice-of-intent-decision/notice-of-intent-decision.dto';

export class CommissionerApplicationDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  applicant: string;

  @AutoMap()
  activeDays: number;

  @AutoMap()
  pausedDays: number;

  @AutoMap()
  paused: boolean;

  @AutoMap()
  type: ApplicationTypeDto;

  @AutoMap()
  region: ApplicationRegionDto;

  @AutoMap()
  localGovernment: LocalGovernmentDto;

  @AutoMap()
  decisionDate: number;

  hasRecons: boolean;
  hasModifications: boolean;

  @AutoMap()
  decisions?: CommissionerDecisionDto[];
}

export class CommissionerPlanningReviewDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  documentName: string;

  @AutoMap()
  open: boolean;

  @AutoMap(() => PlanningReviewTypeDto)
  type: PlanningReviewTypeDto;

  @AutoMap(() => ApplicationRegionDto)
  region: ApplicationRegionDto;

  @AutoMap(() => LocalGovernmentDto)
  localGovernment: LocalGovernmentDto;

  @AutoMap()
  legacyId?: string;
}

export class CommissionerDecisionDto {
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
}

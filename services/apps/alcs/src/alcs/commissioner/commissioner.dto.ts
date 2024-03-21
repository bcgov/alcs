import { AutoMap } from 'automapper-classes';
import { ApplicationReconsiderationDto } from '../application-decision/application-reconsideration/application-reconsideration.dto';
import { LocalGovernmentDto } from '../local-government/local-government.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';
import { PlanningReviewTypeDto } from '../planning-review/planning-review.dto';

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

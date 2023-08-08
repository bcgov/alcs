import { AutoMap } from '@automapper/classes';
import { LocalGovernmentDto } from '../local-government/local-government.dto';
import { ApplicationRegionDto } from '../code/application-code/application-region/application-region.dto';
import { ApplicationTypeDto } from '../code/application-code/application-type/application-type.dto';

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

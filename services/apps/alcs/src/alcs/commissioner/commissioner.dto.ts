import { AutoMap } from '@automapper/classes';
import { ApplicationLocalGovernmentDto } from '../application/application-code/application-local-government/application-local-government.dto';
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
  localGovernment: ApplicationLocalGovernmentDto;

  @AutoMap()
  decisionDate: number;

  hasRecons: boolean;
  hasModifications: boolean;
}

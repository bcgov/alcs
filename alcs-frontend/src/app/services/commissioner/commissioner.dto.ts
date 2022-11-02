import { ApplicationRegionDto, ApplicationTypeDto } from '../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';

export interface CommissionerApplicationDto {
  fileNumber: string;
  applicant: string;
  activeDays: number;
  pausedDays: number;
  paused: boolean;
  type: ApplicationTypeDto;
  region: ApplicationRegionDto;
  localGovernment: ApplicationLocalGovernmentDto;
  hasRecons: boolean;
  hasAmendments: boolean;
}

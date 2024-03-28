import { ApplicationRegionDto, ApplicationTypeDto } from '../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';
import { PlanningReviewTypeDto } from '../planning-review/planning-review.dto';

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
  hasModifications: boolean;
  legacyId?: string;
}

export interface CommissionerPlanningReviewDto {
  fileNumber: string;
  documentName: string;
  open: boolean;
  type: PlanningReviewTypeDto;
  region: ApplicationRegionDto;
  localGovernment: ApplicationLocalGovernmentDto;
  legacyId?: string;
}

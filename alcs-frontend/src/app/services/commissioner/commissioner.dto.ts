import { BaseCodeDto } from 'src/app/shared/dto/base.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from '../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';
import { PlanningReviewTypeDto } from '../planning-review/planning-review.dto';
import { ApplicationDocumentDto } from '../application/application-document/application-document.dto';

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
  decisions?: CommissionerDecisionDto[];
  summary?: string;
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

export interface CommissionerDecisionDto {
  uuid: string;
  date: number;
  outcome: BaseCodeDto;
  decisionDescription: string;
  resolutionNumber: number;
  resolutionYear: number;
  documents: ApplicationDocumentDto[];
  isSubjectToConditions: boolean;
}

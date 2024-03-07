import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationRegionDto } from '../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';
import { CardDto } from '../card/card.dto';

export interface CreatePlanningReviewDto {
  description: string;
  documentName: string;
  submissionDate: number;
  dueDate?: number;
  localGovernmentUuid: string;
  typeCode: string;
  regionCode: string;
}

export interface PlanningReviewDto {
  fileNumber: string;
  open: boolean;
  localGovernment: ApplicationLocalGovernmentDto;
  region: ApplicationRegionDto;
  type: PlanningReviewTypeDto;
  documentName: string;
}

export interface PlanningReviewTypeDto extends BaseCodeDto {
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
}

export interface PlanningReferralDto {
  referralDescription: string;
  dueDate?: number;
  submissionDate: number;
  planningReview: PlanningReviewDto;
  card: CardDto;
}

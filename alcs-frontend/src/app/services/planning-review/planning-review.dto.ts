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
  uuid: string;
  fileNumber: string;
  legacyId: string | null;
  open: boolean;
  localGovernment: ApplicationLocalGovernmentDto;
  region: ApplicationRegionDto;
  type: PlanningReviewTypeDto;
  documentName: string;
}

export interface PlanningReviewDetailedDto extends PlanningReviewDto {
  referrals: PlanningReferralDto[];
}

export interface PlanningReviewTypeDto extends BaseCodeDto {
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
}

export interface CreatePlanningReferralDto {
  planningReviewUuid: string;
  referralDescription: string;
  submissionDate: number;
  dueDate?: number;
}

export interface UpdatePlanningReferralDto {
  referralDescription?: string;
  submissionDate?: number;
  dueDate?: number;
  responseDate?: number;
  responseDescription?: string;
}

export interface PlanningReferralDto {
  uuid: string;
  referralDescription: string;
  dueDate?: number;
  responseDate?: number;
  responseDescription?: string;
  submissionDate: number;
  planningReview: PlanningReviewDto;
  card: CardDto;
}

export interface UpdatePlanningReviewDto {
  open?: boolean;
  typeCode?: string;
}

import { BaseCodeDto } from '../../../shared/dto/base.dto';

export enum DecisionMaker {
  CEO = 'CEOP',
}

export enum CeoCriterion {
  MODIFICATION = 'MODI',
}

export interface UpdateApplicationDecisionDto {
  date?: number;
  outcomeCode?: string;
  chairReviewRequired?: boolean;
  auditDate?: number | null;
  chairReviewDate?: number | null;
  chairReviewOutcome?: boolean | null;
  decisionMakerCode?: string | null;
  ceoCriterionCode?: string | null;
  isTimeExtension?: boolean | null;
  amendsUuid?: string | null;
  reconsidersUuid?: string | null;
}

export interface CreateApplicationDecisionDto extends UpdateApplicationDecisionDto {
  date: number;
  outcomeCode: string;
  resolutionNumber: number;
  resolutionYear: number;
  chairReviewRequired: boolean;
  applicationFileNumber: string;
  amendsUuid: string | null;
  reconsidersUuid: string | null;
}

export interface ApplicationDecisionDto {
  uuid: string;
  date: number;
  outcome: DecisionOutcomeCodeDto;
  resolutionNumber: number;
  resolutionYear: number;
  auditDate?: number | null;
  chairReviewDate?: number | null;
  decisionMaker?: DecisionMakerDto;
  ceoCriterion?: CeoCriterionDto;
  chairReviewRequired: boolean;
  chairReviewOutcome?: boolean | null;
  applicationFileNumber: string;
  documents: DecisionDocumentDto[];
  isTimeExtension?: boolean | null;
  amends?: LinkedResolutionDto;
  reconsiders?: LinkedResolutionDto;
  reconsideredBy?: LinkedResolutionDto[];
  amendedBy?: LinkedResolutionDto[];
}

export interface LinkedResolutionDto {
  uuid: string;
  linkedResolutions: string[];
}

export interface DecisionDocumentDto {
  uuid: string;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface DecisionMakerDto extends BaseCodeDto {}

export interface CeoCriterionDto extends BaseCodeDto {
  number: number;
}

export interface DecisionOutcomeCodeDto extends BaseCodeDto {
  isFirstDecision: boolean;
}

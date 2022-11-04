import { BaseCodeDto } from '../../../shared/dto/base.dto';

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
}

export interface CreateApplicationDecisionDto extends UpdateApplicationDecisionDto {
  date: number;
  outcomeCode: string;
  resolutionNumber: number;
  resolutionYear: number;
  chairReviewRequired: boolean;
  applicationFileNumber: string;
}

export interface ApplicationDecisionDto {
  uuid: string;
  date: number;
  outcome: ApplicationDecisionOutcomeTypeDto;
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

export interface ApplicationDecisionOutcomeTypeDto extends BaseCodeDto {}

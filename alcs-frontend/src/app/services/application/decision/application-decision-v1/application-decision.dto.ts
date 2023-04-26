import { BaseCodeDto } from '../../../../shared/dto/base.dto';

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
  chairReviewOutcomeCode?: string | null;
  decisionMakerCode?: string | null;
  ceoCriterionCode?: string | null;
  isTimeExtension?: boolean | null;
  isOther?: boolean | null;
  modifiesUuid?: string | null;
  reconsidersUuid?: string | null;
}

export interface CreateApplicationDecisionDto extends UpdateApplicationDecisionDto {
  date: number;
  outcomeCode: string;
  resolutionNumber: number;
  resolutionYear: number;
  chairReviewRequired: boolean;
  applicationFileNumber: string;
  modifiesUuid: string | null;
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
  chairReviewOutcome?: ChairReviewOutcomeCodeDto | null;
  applicationFileNumber: string;
  documents: DecisionDocumentDto[];
  isTimeExtension?: boolean | null;
  isOther?: boolean | null;
  modifies?: LinkedResolutionDto;
  reconsiders?: LinkedResolutionDto;
  reconsideredBy?: LinkedResolutionDto[];
  modifiedBy?: LinkedResolutionDto[];
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

export interface ChairReviewOutcomeCodeDto extends BaseCodeDto {}

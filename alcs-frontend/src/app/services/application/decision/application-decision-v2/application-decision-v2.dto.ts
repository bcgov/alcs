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
  isSubjectToConditions?: boolean | null;
  decisionDescription?: string | null;
  isStatsRequired?: boolean | null;
  daysHideFromPublic?: number | null;
  rescindedDate?: number | null;
  rescindedComment?: string | null;
}

export interface CreateApplicationDecisionDto extends UpdateApplicationDecisionDto {
  date: number;
  outcomeCode?: string;
  resolutionNumber?: number | null;
  resolutionYear: number;
  chairReviewRequired: boolean;
  applicationFileNumber: string;
  modifiesUuid: string | null;
  reconsidersUuid: string | null;
  isDraft: boolean;
  decisionComponents?: DecisionComponentDto[];
}

export interface ApplicationDecisionDto {
  uuid: string;
  date: number;
  createdAt: number;
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
  isDraft: boolean;
  isSubjectToConditions?: boolean | null;
  decisionDescription?: string | null;
  isStatsRequired?: boolean | null;
  daysHideFromPublic?: number | null;
  rescindedDate?: number | null;
  rescindedComment?: string | null;
  modifies?: LinkedResolutionDto;
  reconsiders?: LinkedResolutionDto;
  reconsideredBy?: LinkedResolutionDto[];
  modifiedBy?: LinkedResolutionDto[];
  components?: DecisionComponentDto[];
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

export interface DecisionComponentTypeDto extends BaseCodeDto {}

export interface CeoCriterionDto extends BaseCodeDto {
  number: number;
}

export interface DecisionOutcomeCodeDto extends BaseCodeDto {
  isFirstDecision: boolean;
}

export interface ChairReviewOutcomeCodeDto extends BaseCodeDto {}

export interface DecisionComponentDto {
  uuid?: string;

  alrArea?: number;

  agCap?: string;

  agCapSource?: string;

  agCapMap?: string;

  agCapConsultant?: string;

  nfuUseType?: string;

  nfuUseSubType?: string;

  nfuEndDate?: number;

  applicationDecisionComponentTypeCode: string;

  applicationDecisionUuid?: string;
}

export interface DecisionCodesDto {
  outcomes: DecisionOutcomeCodeDto[];
  decisionMakers: DecisionMakerDto[];
  ceoCriterion: CeoCriterionDto[];
  decisionComponentTypes: DecisionComponentTypeDto[];
}

import { BaseCodeDto } from '../../../../shared/dto/base.dto';
import { ProposedLot } from '../../application.dto';

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
  conditions?: UpdateApplicationDecisionConditionDto[];
  linkedResolutionOutcomeCode?: string | null;
  isDraft?: boolean;
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
  chairReviewOutcome: ChairReviewOutcomeCodeDto | null;
  linkedResolutionOutcome: LinkedResolutionOutcomeTypeDto | null;
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
  components: DecisionComponentDto[];
  conditions: ApplicationDecisionConditionDto[];
}

export interface LinkedResolutionDto {
  uuid: string;
  linkedResolutions: string[];
}

export interface ApplicationDecisionWithLinkedResolutionDto extends ApplicationDecisionDto {
  reconsideredByResolutions?: string[];
  modifiedByResolutions?: string[];
  index: number;
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

export interface NfuDecisionComponentDto {
  nfuType?: string | null;
  nfuSubType?: string | null;
  endDate?: number | null;
}

export interface TurpDecisionComponentDto {
  expiryDate?: number | null;
}

export interface NaruDecisionComponentDto {
  expiryDate?: number | null;
  endDate?: number | null;
  naruSubtypeCode?: string | null;
  naruSubtype?: NaruSubtypesDto | null;
}

export interface PofoDecisionComponentDto {
  endDate?: number | null;
  soilFillTypeToPlace?: string | null;
  soilToPlaceArea?: number | null;
  soilToPlaceVolume?: number | null;
  soilToPlaceMaximumDepth?: number | null;
  soilToPlaceAverageDepth?: number | null;
}

export interface RosoDecisionComponentDto {
  endDate?: number | null;
  soilTypeRemoved?: string | null;
  soilToRemoveVolume?: number | null;
  soilToRemoveArea?: number | null;
  soilToRemoveMaximumDepth?: number | null;
  soilToRemoveAverageDepth?: number | null;
}

export interface SubdDecisionComponentDto {
  subdApprovedLots?: ProposedLot[];
}

export interface DecisionComponentDto
  extends NfuDecisionComponentDto,
    TurpDecisionComponentDto,
    PofoDecisionComponentDto,
    RosoDecisionComponentDto,
    NaruDecisionComponentDto,
    SubdDecisionComponentDto {
  uuid?: string;
  alrArea?: number | null;
  agCap?: string | null;
  agCapSource?: string | null;
  agCapMap?: string | null;
  agCapConsultant?: string | null;
  applicationDecisionComponentTypeCode: string;
  applicationDecisionComponentType?: DecisionComponentTypeDto;
  applicationDecisionUuid?: string;
  conditionComponentsLabels?: string;
}

export interface DecisionCodesDto {
  outcomes: DecisionOutcomeCodeDto[];
  decisionMakers: DecisionMakerDto[];
  ceoCriterion: CeoCriterionDto[];
  decisionComponentTypes: DecisionComponentTypeDto[];
  decisionConditionTypes: ApplicationDecisionConditionTypeDto[];
  linkedResolutionOutcomeTypes: LinkedResolutionOutcomeTypeDto[];
  naruSubtypes: NaruSubtypesDto[];
}

export enum APPLICATION_DECISION_COMPONENT_TYPE {
  NFUP = 'NFUP',
  TURP = 'TURP',
  POFO = 'POFO',
  ROSO = 'ROSO',
  PFRS = 'PFRS',
  NARU = 'NARU',
  SUBD = 'SUBD',
}

export interface ApplicationDecisionConditionTypeDto extends BaseCodeDto {}
export interface LinkedResolutionOutcomeTypeDto extends BaseCodeDto {}
export interface NaruSubtypesDto extends BaseCodeDto {}

export interface ApplicationDecisionConditionDto {
  uuid: string;
  componentUuid?: string;
  approvalDependant?: boolean | null;
  securityAmount?: number | null;
  administrativeFee?: number | null;
  description?: string | null;
  completionDate?: number | null;
  supersededDate?: number | null;
  type?: ApplicationDecisionConditionTypeDto | null;
  components?: DecisionComponentDto[] | null;
}

export interface ComponentToCondition {
  componentDecisionUuid?: string;
  componentToConditionType?: string;
  tempId: string;
}
export interface UpdateApplicationDecisionConditionDto {
  uuid?: string;
  componentsToCondition?: ComponentToCondition[] | null;
  approvalDependant?: boolean | null;
  securityAmount?: number | null;
  administrativeFee?: number | null;
  description?: string | null;
  completionDate?: number | null;
  supersededDate?: number | null;
  type?: ApplicationDecisionConditionTypeDto | null;
}

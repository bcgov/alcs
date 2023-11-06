import { BaseCodeDto } from '../../../shared/dto/base.dto';

export interface UpdateNoticeOfIntentDecisionDto {
  resolutionNumber?: number;
  resolutionYear?: number;
  date?: number;
  outcomeCode?: string;
  auditDate?: number | null;
  decisionMaker?: string | null;
  decisionMakerName?: string | null;
  modifiesUuid?: string | null;
  isSubjectToConditions?: boolean | null;
  decisionDescription?: string | null;
  rescindedDate?: number | null;
  rescindedComment?: string | null;
  isDraft?: boolean;
  decisionComponents?: NoticeOfIntentDecisionComponentDto[];
  conditions?: UpdateNoticeOfIntentDecisionConditionDto[];
}

export interface CreateNoticeOfIntentDecisionDto extends UpdateNoticeOfIntentDecisionDto {
  date: number;
  resolutionNumber?: number;
  resolutionYear: number;
  fileNumber: string;
  decisionToCopy?: string;
}

export interface LinkedResolutionDto {
  uuid: string;
  linkedResolutions: string[];
}

export interface NoticeOfIntentDecisionDto {
  uuid: string;
  date: number | null;
  createdAt: Date;
  outcome: NoticeOfIntentDecisionOutcomeCodeDto;
  resolutionNumber: number;
  resolutionYear: number;
  auditDate?: number | null;
  decisionMaker: string | null;
  decisionMakerName: string | null;
  isSubjectToConditions: boolean | null;
  isDraft: boolean;
  wasReleased: boolean;
  decisionDescription?: string | null;
  rescindedDate?: number | null;
  rescindedComment?: string | null;
  fileNumber: string;
  documents: NoticeOfIntentDecisionDocumentDto[];
  modifies?: LinkedResolutionDto;
  modifiedBy?: LinkedResolutionDto[];
  modifiedByResolutions?: string[];
  components: NoticeOfIntentDecisionComponentDto[];
  conditions: NoticeOfIntentDecisionConditionDto[];
}

export interface NoticeOfIntentDecisionDocumentDto {
  uuid: string;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface NoticeOfIntentDecisionOutcomeCodeDto extends BaseCodeDto {}

export interface NoticeOfIntentDecisionConditionTypeDto extends BaseCodeDto {}
export interface NoticeOfIntentDecisionConditionDto {
  uuid: string;
  approvalDependant: boolean | null;
  securityAmount: number | null;
  administrativeFee: number | null;
  description: string | null;
  type: NoticeOfIntentDecisionConditionTypeDto;
  componentUuid: string | null;
  completionDate?: number;
  supersededDate?: number;
  components?: NoticeOfIntentDecisionComponentDto[];
}

export interface ComponentToCondition {
  componentDecisionUuid?: string;
  componentToConditionType?: string;
  tempId: string;
}

export interface UpdateNoticeOfIntentDecisionConditionDto {
  uuid?: string;
  componentsToCondition?: ComponentToCondition[];
  approvalDependant?: boolean | null;
  securityAmount?: number | null;
  administrativeFee?: number | null;
  description?: string | null;
  type?: NoticeOfIntentDecisionConditionTypeDto;
  completionDate?: number | null;
  supersededDate?: number | null;
}

export interface NoticeOfIntentDecisionComponentTypeDto extends BaseCodeDto {}

export interface UpdateNoticeOfIntentDecisionComponentDto {
  uuid?: string;
  alrArea?: number;
  agCap?: string;
  agCapSource?: string;
  agCapMap?: string;
  agCapConsultant?: string;
  noticeOfIntentDecisionComponentTypeCode: string;
  endDate?: number;
  expiryDate?: number;
  soilFillTypeToPlace?: string;
  soilToPlaceVolume?: number | null;
  soilToPlaceArea?: number | null;
  soilToPlaceMaximumDepth?: number | null;
  soilToPlaceAverageDepth?: number | null;
  soilTypeRemoved?: string;
  soilToRemoveVolume?: number | null;
  soilToRemoveArea?: number | null;
  soilToRemoveMaximumDepth?: number | null;
  soilToRemoveAverageDepth?: number | null;
}

export interface NoticeOfIntentDecisionComponentDto
  extends PofoDecisionComponentDto,
    RosoDecisionComponentDto,
    PfrsDecisionComponentDto {
  uuid?: string;
  alrArea?: number | null;
  agCap?: string | null;
  agCapSource?: string | null;
  agCapMap?: string | null;
  agCapConsultant?: string | null;
  noticeOfIntentDecisionUuid?: string;
  noticeOfIntentDecisionComponentTypeCode: string;
  noticeOfIntentDecisionComponentType?: NoticeOfIntentDecisionComponentTypeDto;
}

export interface PfrsDecisionComponentDto extends PofoDecisionComponentDto, RosoDecisionComponentDto {
  endDate2?: number | null;
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

export interface NoticeOfIntentDecisionCodesDto {
  outcomes: NoticeOfIntentDecisionOutcomeCodeDto[];
  decisionComponentTypes: NoticeOfIntentDecisionComponentTypeDto[];
  decisionConditionTypes: NoticeOfIntentDecisionConditionTypeDto[];
}

export interface NoticeOfIntentDecisionWithLinkedResolutionDto extends NoticeOfIntentDecisionDto {
  modifiedByResolutions?: string[];
  index: number;
}

export enum NOI_DECISION_COMPONENT_TYPE {
  POFO = 'POFO',
  ROSO = 'ROSO',
  PFRS = 'PFRS',
}

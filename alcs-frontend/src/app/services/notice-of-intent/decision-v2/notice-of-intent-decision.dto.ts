import { UserDto } from '../../user/user.dto';
import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { DateLabel, DateType } from '../../application/decision/application-decision-v2/application-decision-v2.dto';
import { CardDto } from '../../card/card.dto';
import { NoticeOfIntentTypeDto } from '../notice-of-intent.dto';

export enum ConditionType {
  FINANCIAL_SECURITY = 'BOND',
}

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
  ccEmails?: string[];
  isFlagged?: boolean;
  reasonFlagged?: string | null;
  followUpAt?: number | null;
  flaggedByUuid?: string | null;
  flagEditedByUuid?: string | null;
  flagEditedAt?: number | null;
  sendEmail?: boolean;
}

export interface CreateNoticeOfIntentDecisionDto extends UpdateNoticeOfIntentDecisionDto {
  date: number;
  resolutionNumber?: number;
  resolutionYear: number;
  fileNumber: string;
  decisionToCopy?: string;
}

export interface NoticeOfIntentHomeDto {
  uuid: string;
  fileNumber: string;
  applicant: string;
  activeDays: number;
  paused: boolean;
  pausedDays: number;
  type: NoticeOfIntentTypeDto;
}

export interface NoticeOfIntentDecisionHomeDto {
  uuid: string;
  noticeOfIntent: NoticeOfIntentHomeDto;
}

export interface NoticeOfIntentDecisionConditionHomeCardDto {
  uuid: string;
  cardUuid: string;
  card: CardDto;
  noticeOfIntentFileNumber?: string | null;
}

export interface NoticeOfIntentDecisionConditionHomeDto {
  conditionCard: NoticeOfIntentDecisionConditionHomeCardDto | null;
  status?: string | null;
  isModification: boolean;
  decision: NoticeOfIntentDecisionHomeDto;
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
  isFlagged: boolean;
  reasonFlagged: string | null;
  followUpAt: number | null;
  flaggedBy: UserDto | null;
  flagEditedBy: UserDto | null;
  flagEditedAt: number | null;
  canDraftBeDeleted: boolean;
}

export interface NoticeOfIntentDecisionDocumentDto {
  uuid: string;
  documentUuid: string;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
  fileSize: number | null;
}

export interface NoticeOfIntentDecisionOutcomeCodeDto extends BaseCodeDto {}

export interface NoticeOfIntentDecisionConditionTypeDto extends BaseCodeDto {
  isActive: boolean;
  isComponentToConditionChecked?: boolean | null;
  isDescriptionChecked?: boolean | null;
  isAdministrativeFeeAmountChecked: boolean;
  isAdministrativeFeeAmountRequired?: boolean | null;
  administrativeFeeAmount?: number | null;
  isDateChecked: boolean;
  isDateRequired?: boolean | null;
  dateType?: DateType | null;
  singleDateLabel?: DateLabel | null;
  isSecurityAmountChecked: boolean;
  isSecurityAmountRequired?: boolean | null;
}

export interface NoticeOfIntentDecisionConditionDto {
  uuid: string;
  securityAmount: number | null;
  administrativeFee: number | null;
  description: string | null;
  type: NoticeOfIntentDecisionConditionTypeDto;
  componentUuid: string | null;
  components?: NoticeOfIntentDecisionComponentDto[];
  dates?: NoticeOfIntentDecisionConditionDateDto[];
  conditionCard?: NoticeOfIntentDecisionConditionCardDto | null;
  status?: string | null;
  decision: NoticeOfIntentDecisionDto | null;
}

export interface ComponentToCondition {
  componentDecisionUuid?: string;
  componentToConditionType?: string;
  tempId: string;
}

export interface NoticeOfIntentDecisionConditionDateDto {
  uuid?: string;
  date?: number;
  completedDate?: number | null;
  comment?: string | null;
}

export interface UpdateNoticeOfIntentDecisionConditionDto {
  uuid?: string;
  componentsToCondition?: ComponentToCondition[];
  securityAmount?: number | null;
  administrativeFee?: number | null;
  description?: string | null;
  type?: NoticeOfIntentDecisionConditionTypeDto;
  dates?: NoticeOfIntentDecisionConditionDateDto[];
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

export interface NoticeOfIntentDecisionComponentDto extends PofoDecisionComponentDto, RosoDecisionComponentDto {
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
export interface PfrsDecisionComponentDto extends PofoDecisionComponentDto, RosoDecisionComponentDto {}

export interface PofoDecisionComponentDto {
  soilFillTypeToPlace?: string | null;
  soilToPlaceArea?: number | null;
  soilToPlaceVolume?: number | null;
  soilToPlaceMaximumDepth?: number | null;
  soilToPlaceAverageDepth?: number | null;
}

export interface RosoDecisionComponentDto {
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

export interface NoticeOfIntentDecisionConditionCardDto {
  uuid: string;
  conditions: NoticeOfIntentDecisionConditionDto[];
  cardUuid: string;
  card: CardDto;
  decisionUuid: string;
  fileNumber: string;
}

export interface CreateNoticeOfIntentDecisionConditionCardDto {
  conditionsUuids: string[];
  decisionUuid: string;
  cardStatusCode: string;
}

export interface UpdateNoticeOfIntentDecisionConditionCardDto {
  conditionsUuids?: string[] | null;
  cardStatusCode?: string | null;
}

export interface NoticeOfIntentDecisionConditionCardUuidDto {
  uuid: string;
}

export interface NoticeOfIntentDecisionConditionCardBoardDto {
  uuid: string;
  conditions: NoticeOfIntentDecisionConditionDto[];
  card: CardDto;
  decisionUuid: string;
  decisionOrder: number;
  decisionIsFlagged: boolean;
  fileNumber: string;
  applicant: string;
  type?: NoticeOfIntentTypeDto;
  isModification: boolean;
}

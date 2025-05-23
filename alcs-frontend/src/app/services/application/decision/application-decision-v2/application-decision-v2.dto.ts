import { UserDto } from '../../../user/user.dto';
import { BaseCodeDto } from '../../../../shared/dto/base.dto';
import { CardDto } from '../../../card/card.dto';
import { ApplicationTypeDto } from '../../application-code.dto';
import { ApplicationDto } from '../../application.dto';

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
  rescindedDate?: number | null;
  rescindedComment?: string | null;
  conditions?: UpdateApplicationDecisionConditionDto[];
  isDraft?: boolean;
  ccEmails?: string[];
  isFlagged?: boolean;
  reasonFlagged?: string | null;
  followUpAt?: number | null;
  flaggedByUuid?: string | null;
  flagEditedByUuid?: string | null;
  flagEditedAt?: number | null;
  sendEmail?: boolean;
}

export interface CreateApplicationDecisionDto extends UpdateApplicationDecisionDto {
  date: number;
  decisionToCopy?: string;
  outcomeCode?: string;
  resolutionNumber?: number | null;
  resolutionYear: number;
  chairReviewRequired: boolean;
  applicationFileNumber: string;
  modifiesUuid: string | null;
  reconsidersUuid: string | null;
  isDraft: boolean;
  decisionComponents?: ApplicationDecisionComponentDto[];
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
  applicationFileNumber: string;
  documents: ApplicationDecisionDocumentDto[];
  isTimeExtension?: boolean | null;
  isOther?: boolean | null;
  isDraft: boolean;
  isSubjectToConditions?: boolean | null;
  decisionDescription?: string | null;
  rescindedDate?: number | null;
  rescindedComment?: string | null;
  modifies?: LinkedResolutionDto;
  reconsiders?: LinkedResolutionDto;
  reconsideredBy?: LinkedResolutionDto[];
  modifiedBy?: LinkedResolutionDto[];
  components: ApplicationDecisionComponentDto[];
  conditions: ApplicationDecisionConditionDto[];
  wasReleased: boolean;
  conditionsCards: ApplicationDecisionConditionCardDto[];
  isFlagged: boolean;
  reasonFlagged: string | null;
  followUpAt: number | null;
  flaggedBy: UserDto | null;
  flagEditedBy: UserDto | null;
  flagEditedAt: number | null;
  application: ApplicationDto;
  canDraftBeDeleted: boolean;
}

export interface ApplicationHomeDto {
  uuid: string;
  fileNumber: string;
  applicant: string;
  activeDays: number;
  paused: boolean;
  pausedDays: number;
  type: ApplicationTypeDto;
}

export interface ApplicationDecisionHomeDto {
  uuid: string;
  application: ApplicationHomeDto;
}

export interface ApplicationDecisionConditionHomeCardDto {
  uuid: string;
  cardUuid: string;
  card: CardDto;
  applicationFileNumber?: string | null;
}

export interface ApplicationDecisionConditionHomeDto {
  conditionCard: ApplicationDecisionConditionHomeCardDto | null;
  status?: string | null;
  isReconsideration: boolean;
  isModification: boolean;
  decision: ApplicationDecisionHomeDto;
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

export interface ApplicationDecisionDocumentDto {
  uuid: string;
  documentUuid: string;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
  fileSize?: number;
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

export interface UpdateProposedDecisionLotDto {
  type: 'Lot' | 'Road Dedication' | null;
  size: number | null;
  alrArea?: number | null;
}

export interface ProposedDecisionLotDto {
  uuid: string;
  planNumbers: string | null;
  index: number;
  componentUuid: string;
  type: 'Lot' | 'Road Dedication' | null;
  size: number | null;
  alrArea?: number | null;
}

export interface NfuDecisionComponentDto {
  nfuType?: string | null;
  nfuSubType?: string | null;
}

export interface NaruDecisionComponentDto {
  naruSubtypeCode?: string | null;
  naruSubtype?: NaruSubtypesDto | null;
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

export interface SubdDecisionComponentDto {
  // subdApprovedLots?: ProposedDecisionLotDto[];
  lots?: ProposedDecisionLotDto[];
}

export interface InclExclDecisionComponentDto {
  inclExclApplicantType?: string | null;
}

export interface ApplicationDecisionComponentDto
  extends NfuDecisionComponentDto,
    PofoDecisionComponentDto,
    RosoDecisionComponentDto,
    NaruDecisionComponentDto,
    SubdDecisionComponentDto,
    InclExclDecisionComponentDto,
    PfrsDecisionComponentDto {
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

export interface ApplicationDecisionCodesDto {
  outcomes: DecisionOutcomeCodeDto[];
  decisionMakers: DecisionMakerDto[];
  ceoCriterion: CeoCriterionDto[];
  decisionComponentTypes: DecisionComponentTypeDto[];
  decisionConditionTypes: ApplicationDecisionConditionTypeDto[];
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
  INCL = 'INCL',
  EXCL = 'EXCL',
  COVE = 'COVE',
}

export enum DateLabel {
  DUE_DATE = 'Due Date',
  END_DATE = 'End Date',
}

export enum DateType {
  SINGLE = 'Single',
  MULTIPLE = 'Multiple',
}

export enum conditionType {
  FINANCIAL_SECURITY = 'BOND',
}

export interface ApplicationDecisionConditionTypeDto extends BaseCodeDto {
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

export interface NaruSubtypesDto extends BaseCodeDto {}

export interface ApplicationDecisionConditionDto {
  uuid: string;
  componentUuid?: string;
  securityAmount?: number | null;
  administrativeFee?: number | null;
  description?: string | null;
  type?: ApplicationDecisionConditionTypeDto | null;
  components?: ApplicationDecisionComponentDto[] | null;
  dates?: ApplicationDecisionConditionDateDto[];
  conditionCard?: ApplicationDecisionConditionCardDto | null;
  status?: string | null;
  decision: ApplicationDecisionDto | null;
  order: number;
}

export interface UpdateApplicationDecisionConditionDto {
  uuid?: string;
  componentsToCondition?: ComponentToCondition[] | null;
  securityAmount?: number | null;
  administrativeFee?: number | null;
  description?: string | null;
  type?: ApplicationDecisionConditionTypeDto | null;
  dates?: ApplicationDecisionConditionDateDto[];
  order?: number;
}

export interface ComponentToCondition {
  componentDecisionUuid?: string;
  componentToConditionType?: string;
  tempId: string;
}

export interface ApplicationDecisionConditionDateDto {
  uuid?: string;
  date?: number;
  completedDate?: number | null;
  comment?: string | null;
}

export interface ApplicationDecisionComponentToConditionLotDto {
  componentLotUuid: string;
  conditionUuid: string;
  planNumbers: string | null;
}

export interface ApplicationDecisionConditionToComponentPlanNumberDto {
  applicationDecisionComponentUuid: string;
  applicationDecisionConditionUuid: string;
  planNumbers: string | null;
}

export interface ApplicationDecisionConditionCardDto {
  uuid: string;
  conditions: ApplicationDecisionConditionDto[];
  cardUuid: string;
  card: CardDto;
  decisionUuid: string;
  applicationFileNumber: string;
}

export interface CreateApplicationDecisionConditionCardDto {
  conditionsUuids: string[];
  decisionUuid: string;
  cardStatusCode: string;
}

export interface UpdateApplicationDecisionConditionCardDto {
  conditionsUuids?: string[] | null;
  cardStatusCode?: string | null;
}

export interface ApplicationDecisionConditionCardUuidDto {
  uuid: string;
}

export interface ApplicationDecisionConditionCardBoardDto {
  uuid: string;
  conditions: ApplicationDecisionConditionDto[];
  card: CardDto;
  decisionUuid: string;
  decisionOrder: number;
  decisionIsFlagged: boolean;
  fileNumber: string;
  applicant: string;
  type?: ApplicationTypeDto;
  isReconsideration: boolean;
  isModification: boolean;
  decisionMeetings: DecisionConditionCardMeetingDto[];
}

export interface DecisionConditionCardMeetingDto {
  date: number;
}

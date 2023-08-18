import { BaseCodeDto } from '../../shared/dto/base.dto';
import { SYSTEM_SOURCE_TYPES } from '../../shared/dto/system-source.types.dto';
import { ApplicationRegionDto } from '../application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../application/application-local-government/application-local-government.dto';
import { CardDto } from '../card/card.dto';

export interface NoticeOfIntentSubtypeDto extends BaseCodeDto {
  isActive: boolean;
}

export interface CreateNoticeOfIntentDto {
  fileNumber: string;
  localGovernmentUuid: string;
  regionCode: string;
  applicant: string;
  boardCode: string;
  dateSubmittedToAlc: number;
}

export interface NoticeOfIntentTypeDto extends BaseCodeDto {
  shortLabel: string;
  backgroundColor: string;
  textColor: string;
}

export interface NoticeOfIntentDto {
  uuid: string;
  fileNumber: string;
  card: CardDto;
  localGovernment: ApplicationLocalGovernmentDto;
  region: ApplicationRegionDto;
  applicant: string;
  type: NoticeOfIntentTypeDto;
  source: SYSTEM_SOURCE_TYPES;

  dateSubmittedToAlc?: number;
  feePaidDate?: number;
  feeWaived?: boolean | null;
  feeSplitWithLg?: boolean | null;
  feeAmount?: string;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  summary?: string;
  subtype: NoticeOfIntentSubtypeDto[];
  retroactive: boolean | null;
  decisionDate?: number;

  activeDays: number | null;
  pausedDays: number | null;
  paused: boolean;

  alrArea?: number;
  agCap?: string;
  agCapSource?: string;
  agCapMap?: string;
  agCapConsultant?: string;
  staffObservations?: string;
  proposalEndDate?: number;
}

export interface UpdateNoticeOfIntentDto {
  dateSubmittedToAlc?: number;
  feePaidDate?: number;
  feeWaived?: boolean | null;
  feeSplitWithLg?: boolean | null;
  feeAmount?: number | null;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  summary?: string;
  retroactive?: boolean;
  subtype?: string[];

  alrArea?: number;
  agCap?: string;
  agCapSource?: string;
  agCapMap?: string;
  agCapConsultant?: string;
  staffObservations?: string;
  proposalEndDate?: number;
}

export enum NOI_SUBMISSION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  SUBMITTED_TO_ALC_INCOMPLETE = 'SUIN', //Submitted to ALC - Incomplete
  RECEIVED_BY_ALC = 'RECA', //Received By ALC
  ALC_DECISION = 'ALCD', //Decision Released
  CANCELLED = 'CANC',
}

export interface NoticeOfIntentSubmissionStatusDto extends BaseCodeDto {
  code: NOI_SUBMISSION_STATUS;
  portalBackgroundColor: string;
  portalColor: string;
}

export interface NoticeOfIntentSubmissionToSubmissionStatusDto {
  submissionUuid: string;
  effectiveDate: number | null;
  statusTypeCode: string;
  status: NoticeOfIntentSubmissionStatusDto;
}

export interface NoticeOfIntentSubmissionDto {
  fileNumber: string;
  uuid: string;
  createdAt: number;
  updatedAt: number;
  applicant: string;
  localGovernmentUuid: string;
  type: string;
  typeCode: string;
  status: NoticeOfIntentSubmissionStatusDto;
  submissionStatuses: NoticeOfIntentSubmissionToSubmissionStatusDto[];
  owners: NoticeOfIntentOwnerDto[];
  canEdit: boolean;
  canView: boolean;

  purpose: string | null;
  parcelsAgricultureDescription: string;
  parcelsAgricultureImprovementDescription: string;
  parcelsNonAgricultureUseDescription: string;
  northLandUseType: string;
  northLandUseTypeDescription: string;
  eastLandUseType: string;
  eastLandUseTypeDescription: string;
  southLandUseType: string;
  southLandUseTypeDescription: string;
  westLandUseType: string;
  westLandUseTypeDescription: string;

  primaryContactOwnerUuid: string | null;
  primaryContact?: SubmittedNoticeOfIntentOwnerDto;

  //Soil Fields
  soilIsFollowUp: boolean | null;
  soilFollowUpIDs: string | null;
  soilTypeRemoved: string | null;
  soilToRemoveVolume: number | null;
  soilToRemoveArea: number | null;
  soilToRemoveMaximumDepth: number | null;
  soilToRemoveAverageDepth: number | null;
  soilAlreadyRemovedVolume: number | null;
  soilAlreadyRemovedArea: number | null;
  soilAlreadyRemovedMaximumDepth: number | null;
  soilAlreadyRemovedAverageDepth: number | null;
  soilToPlaceVolume: number | null;
  soilToPlaceArea: number | null;
  soilToPlaceMaximumDepth: number | null;
  soilToPlaceAverageDepth: number | null;
  soilAlreadyPlacedVolume: number | null;
  soilAlreadyPlacedArea: number | null;
  soilAlreadyPlacedMaximumDepth: number | null;
  soilAlreadyPlacedAverageDepth: number | null;
  soilProjectDurationAmount: number | null;
  soilProjectDurationUnit?: string | null;
  soilFillTypeToPlace?: string | null;
  soilIsExtractionOrMining?: boolean;
  soilHasSubmittedNotice?: boolean;
  soilIsRemovingSoilForNewStructure: boolean | null;
  soilStructureFarmUseReason?: string | null;
  soilStructureResidentialUseReason?: string | null;
  soilAgriParcelActivity?: string | null;
  soilStructureResidentialAccessoryUseReason?: string | null;
  soilIsAreaWideFilling?: boolean | null;
  soilProposedStructures: ProposedStructure[];
}

export interface NoticeOfIntentSubmissionDetailedDto extends NoticeOfIntentSubmissionDto {
  purpose: string | null;
  parcelsAgricultureDescription: string;
  parcelsAgricultureImprovementDescription: string;
  parcelsNonAgricultureUseDescription: string;
  northLandUseType: string;
  northLandUseTypeDescription: string;
  eastLandUseType: string;
  eastLandUseTypeDescription: string;
  southLandUseType: string;
  southLandUseTypeDescription: string;
  westLandUseType: string;
  westLandUseTypeDescription: string;

  primaryContactOwnerUuid: string | null;
  primaryContact?: SubmittedNoticeOfIntentOwnerDto;

  //Soil Fields
  soilIsFollowUp: boolean | null;
  soilFollowUpIDs: string | null;
  soilTypeRemoved: string | null;
  soilToRemoveVolume: number | null;
  soilToRemoveArea: number | null;
  soilToRemoveMaximumDepth: number | null;
  soilToRemoveAverageDepth: number | null;
  soilAlreadyRemovedVolume: number | null;
  soilAlreadyRemovedArea: number | null;
  soilAlreadyRemovedMaximumDepth: number | null;
  soilAlreadyRemovedAverageDepth: number | null;
  soilToPlaceVolume: number | null;
  soilToPlaceArea: number | null;
  soilToPlaceMaximumDepth: number | null;
  soilToPlaceAverageDepth: number | null;
  soilAlreadyPlacedVolume: number | null;
  soilAlreadyPlacedArea: number | null;
  soilAlreadyPlacedMaximumDepth: number | null;
  soilAlreadyPlacedAverageDepth: number | null;
  soilProjectDurationAmount: number | null;
  soilProjectDurationUnit?: string | null;
  soilFillTypeToPlace?: string | null;
  soilIsExtractionOrMining?: boolean;
  soilHasSubmittedNotice?: boolean;
  soilIsRemovingSoilForNewStructure: boolean | null;
  soilStructureFarmUseReason?: string | null;
  soilStructureResidentialUseReason?: string | null;
  soilAgriParcelActivity?: string | null;
  soilStructureResidentialAccessoryUseReason?: string | null;
  soilProposedStructures: ProposedStructure[];
}

export interface NoticeOfIntentSubmissionUpdateDto {
  applicant?: string | null;
  purpose?: string | null;
  localGovernmentUuid?: string | null;
  typeCode?: string | null;
  parcelsAgricultureDescription?: string | null;
  parcelsAgricultureImprovementDescription?: string | null;
  parcelsNonAgricultureUseDescription?: string | null;
  northLandUseType?: string | null;
  northLandUseTypeDescription?: string | null;
  eastLandUseType?: string | null;
  eastLandUseTypeDescription?: string | null;
  southLandUseType?: string | null;
  southLandUseTypeDescription?: string | null;
  westLandUseType?: string | null;
  westLandUseTypeDescription?: string | null;

  //Soil Fields
  soilIsFollowUp?: boolean | null;
  soilFollowUpIDs?: string | null;
  soilTypeRemoved?: string | null;
  soilToRemoveVolume?: number | null;
  soilToRemoveArea?: number | null;
  soilToRemoveMaximumDepth?: number | null;
  soilToRemoveAverageDepth?: number | null;
  soilAlreadyRemovedVolume?: number | null;
  soilAlreadyRemovedArea?: number | null;
  soilAlreadyRemovedMaximumDepth?: number | null;
  soilAlreadyRemovedAverageDepth?: number | null;
  soilToPlaceVolume?: number | null;
  soilToPlaceArea?: number | null;
  soilToPlaceMaximumDepth?: number | null;
  soilToPlaceAverageDepth?: number | null;
  soilAlreadyPlacedVolume?: number | null;
  soilAlreadyPlacedArea?: number | null;
  soilAlreadyPlacedMaximumDepth?: number | null;
  soilAlreadyPlacedAverageDepth?: number | null;
  soilProjectDurationAmount?: number | null;
  soilProjectDurationUnit?: string | null;
  soilFillTypeToPlace?: string | null;
  soilIsExtractionOrMining?: boolean | null;
  soilHasSubmittedNotice?: boolean | null;
  soilIsRemovingSoilForNewStructure?: boolean | null;
  soilStructureFarmUseReason?: string | null;
  soilStructureResidentialUseReason?: string | null;
  soilAgriParcelActivity?: string | null;
  soilStructureResidentialAccessoryUseReason?: string | null;
  soilProposedStructures?: ProposedStructure[];
}

export interface ProposedStructure {
  type: STRUCTURE_TYPES | null;
  area: number | null;
}

export enum STRUCTURE_TYPES {
  FARM_STRUCTURE = 'Farm Structure',
  PRINCIPAL_RESIDENCE = 'Residential - Principal Residence',
  ADDITIONAL_RESIDENCE = 'Residential - Additional Residence',
  ACCESSORY_STRUCTURE = 'Residential - Accessory Structure',
}

export interface NoticeOfIntentOwnerDto {
  uuid: string;
  noticeOfIntentSubmissionUuid: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phoneNumber: string | null;
  email: string | null;
  type: OwnerTypeDto;
}

export enum OWNER_TYPE {
  INDIVIDUAL = 'INDV',
  ORGANIZATION = 'ORGZ',
  AGENT = 'AGEN',
  CROWN = 'CRWN',
  GOVERNMENT = 'GOVR',
}

export interface OwnerTypeDto extends BaseCodeDto {
  code: OWNER_TYPE;
}

export const RESIDENTIAL_STRUCTURE_TYPES = [
  STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
  STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
  STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
];

export interface SubmittedNoticeOfIntentOwnerDto {
  uuid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  phoneNumber: string;
  email: string;
  type: BaseCodeDto;
  corporateSummaryUuid?: string;
}

export interface NoticeOfIntentParcelDto {
  uuid: string;
  pid?: string;
  pin?: string;
  legalDescription: string;
  mapAreaHectares: string;
  purchasedDate?: number;
  isFarm?: boolean;
  ownershipType?: string;
  crownLandOwnerType?: string;
  parcelType?: string;
  certificateOfTitleUuid?: string;
  owners: SubmittedNoticeOfIntentOwnerDto[];
  alrArea: number;
}

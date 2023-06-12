import { BaseCodeDto } from '../../shared/dto/base.dto';
import { CardDto } from '../card/card.dto';
import { UserDto } from '../user/user.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from './application-code.dto';
import { ApplicationDocumentDto } from './application-document/application-document.dto';
import { ApplicationLocalGovernmentDto } from './application-local-government/application-local-government.dto';

export enum APPLICATION_SYSTEM_SOURCE_TYPES {
  APPLICANT = 'APPLICANT',
  ALCS = 'ALCS',
}

export enum PARCEL_OWNERSHIP_TYPE {
  FEE_SIMPLE = 'SMPL',
  CROWN = 'CRWN',
}

export interface StatusHistory {
  type: 'status_change';
  label: string;
  description: string;
  time: number;
}

export interface CreateApplicationDto {
  fileNumber: string;
  applicant: string;
  typeCode: string;
  dateSubmittedToAlc: number;
  regionCode?: string;
  localGovernmentUuid?: string;
}

export interface ApplicationDecisionMeetingDto {
  date: Date;
}

export interface ProposedLot {
  type: 'Lot' | 'Road Dedication' | null;
  size: number | null;
}

export interface ApplicationReviewDto {
  localGovernmentFileNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phoneNumber: string;
  email: string;
  isOCPDesignation: boolean | null;
  OCPBylawName: string | null;
  OCPDesignation: string | null;
  OCPConsistent: boolean | null;
  isSubjectToZoning: boolean | null;
  zoningBylawName: string | null;
  zoningDesignation: string | null;
  zoningMinimumLotSize: string | null;
  isZoningConsistent: boolean | null;
  isAuthorized: boolean | null;
}

export interface SubmittedApplicationOwnerDto {
  displayName: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  phoneNumber: string;
  email: string;
  type: BaseCodeDto;
  corporateSummaryDocumentUuid?: string;
}

export interface ApplicationParcelDocumentDto {
  type: string;
  uuid: string;
  fileName: string;
  fileSize: number;
  uploadedBy?: string;
  uploadedAt: number;
  documentUuid: string;
}

export interface SubmittedApplicationParcelDto {
  pid?: string;
  pin?: string;
  legalDescription: string;
  mapAreaHectares: string;
  purchasedDate?: number;
  isFarm: boolean;
  ownershipType: string;
  crownLandOwnerType: string;
  parcelType: string;
  documentUuids: string[];
  owners: SubmittedApplicationOwnerDto[];
  documents: ApplicationParcelDocumentDto[];
}

export interface ApplicationSubmissionDto {
  parcels: SubmittedApplicationParcelDto[];
  otherParcels: SubmittedApplicationParcelDto[];
  documents: ApplicationDocumentDto[];
  hasOtherParcelsInCommunity?: boolean | null;
  primaryContact: SubmittedApplicationOwnerDto;
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
  typeCode: string;

  //NFU Data
  nfuHectares?: string;
  nfuPurpose?: string;
  nfuOutsideLands?: string;
  nfuAgricultureSupport?: string;
  nfuWillImportFill?: boolean;
  nfuTotalFillPlacement?: string;
  nfuMaxFillDepth?: string;
  nfuFillVolume?: string;
  nfuProjectDurationAmount?: string;
  nfuProjectDurationUnit?: string;
  nfuFillTypeDescription?: string;
  nfuFillOriginDescription?: string;

  //TUR Data
  turPurpose?: string;
  turOutsideLands?: string;
  turAgriculturalActivities?: string;
  turReduceNegativeImpacts?: string;
  turTotalCorridorArea?: string;

  //Subdivision Fields
  subdPurpose?: string;
  subdSuitability?: string;
  subdAgricultureSupport?: string;
  subdIsHomeSiteSeverance?: boolean;
  subdProposedLots: ProposedLot[];

  //Soil Fields
  soilIsNOIFollowUp?: boolean | null;
  soilNOIIDs?: string | null;
  soilHasPreviousALCAuthorization?: boolean | null;
  soilApplicationIDs?: string | null;
  soilPurpose?: string | null;
  soilTypeRemoved?: string | null;
  soilReduceNegativeImpacts?: string | null;
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
  soilProjectDurationUnit?: string;
  soilFillTypeToPlace?: string;
  soilAlternativeMeasures?: string;
  soilIsExtractionOrMining?: boolean;
  soilHasSubmittedNotice?: boolean;
}

export interface ApplicationDto {
  uuid: string;
  fileNumber: string;
  applicant: string;
  summary?: string;
  type: ApplicationTypeDto;
  dateSubmittedToAlc: number;
  feePaidDate?: number;
  feeWaived?: boolean;
  feeSplitWithLg?: boolean;
  feeAmount?: string;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  decisionDate?: number;
  notificationSentDate?: number;
  region: ApplicationRegionDto;
  localGovernment: ApplicationLocalGovernmentDto;
  activeDays: number;
  pausedDays: number;
  paused: boolean;
  decisionMeetings: ApplicationDecisionMeetingDto[];
  card?: CardDto;
  statusHistory: StatusHistory[];
  submittedApplication?: ApplicationSubmissionDto;
  source: 'ALCS' | 'APPLICANT';
  alrArea?: number;
  agCap?: string;
  agCapSource?: string;
  agCapMap?: string;
  agCapConsultant?: string;
  staffObservations?: string;
  nfuUseType?: string;
  nfuUseSubType?: string;
  proposalEndDate?: number;
}

export interface UpdateApplicationDto {
  dateSubmittedToAlc?: number;
  applicant?: string;
  statusCode?: string;
  regionCode?: string;
  summary?: string;
  dateAcknowledgedIncomplete?: number;
  dateReceivedAllItems?: number;
  dateAcknowledgedComplete?: number;
  typeCode?: string;
  assigneeUuid?: string | null;
  assignee?: UserDto;
  highPriority?: boolean;
  notificationSentDate?: number;
  feePaidDate?: number;
  feeWaived?: boolean;
  feeSplitWithLg?: boolean;
  feeAmount?: string;
  alrArea?: string;
  agCap?: string;
  agCapSource?: string;
  agCapMap?: string;
  agCapConsultant?: string;
  staffObservations?: string;
  nfuUseType?: string;
  nfuUseSubType?: string;
  proposalEndDate?: number;
}

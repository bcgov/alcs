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
  isFarm?: boolean;
  ownershipType?: string;
  crownLandOwnerType?: string;
  parcelType?: string;
  documentUuids: string[];
  owners: SubmittedApplicationOwnerDto[];
  documents: ApplicationParcelDocumentDto[];
}

export interface ApplicationSubmissionDto {
  parcels: SubmittedApplicationParcelDto[];
  otherParcels: SubmittedApplicationParcelDto[];
  documents: ApplicationDocumentDto[];
  hasOtherParcelsInCommunity?: boolean | null;
  primaryContact?: SubmittedApplicationOwnerDto;
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
  nfuHectares: string | null;
  nfuPurpose: string | null;
  nfuOutsideLands: string | null;
  nfuAgricultureSupport: string | null;
  nfuWillImportFill: boolean | null;
  nfuTotalFillPlacement: string | null;
  nfuMaxFillDepth: string | null;
  nfuFillVolume: string | null;
  nfuProjectDurationAmount: string | null;
  nfuProjectDurationUnit: string | null;
  nfuFillTypeDescription: string | null;
  nfuFillOriginDescription: string | null;

  //TUR Data
  turPurpose: string | null;
  turOutsideLands: string | null;
  turAgriculturalActivities: string | null;
  turReduceNegativeImpacts: string | null;
  turTotalCorridorArea: string | null;

  //Subdivision Fields
  subdPurpose: string | null;
  subdSuitability: string | null;
  subdAgricultureSupport: string | null;
  subdIsHomeSiteSeverance: boolean | null;
  subdProposedLots: ProposedLot[];

  //Soil Fields
  soilIsNOIFollowUp: boolean | null;
  soilNOIIDs: string | null;
  soilHasPreviousALCAuthorization: boolean | null;
  soilApplicationIDs: string | null;
  soilPurpose: string | null;
  soilTypeRemoved: string | null;
  soilReduceNegativeImpacts: string | null;
  soilToRemoveVolume: number | null;
  soilToRemoveArea: number | null;
  soilToRemoveMaximumDepth?: number | null;
  soilToRemoveAverageDepth?: number | null;
  soilAlreadyRemovedVolume?: number | null;
  soilAlreadyRemovedArea?: number | null;
  soilAlreadyRemovedMaximumDepth?: number | null;
  soilAlreadyRemovedAverageDepth?: number | null;
  soilToPlaceVolume?: number | null;
  soilToPlaceArea?: number | null;
  soilToPlaceMaximumDepth: number | null;
  soilToPlaceAverageDepth: number | null;
  soilAlreadyPlacedVolume: number | null;
  soilAlreadyPlacedArea: number | null;
  soilAlreadyPlacedMaximumDepth: number | null;
  soilAlreadyPlacedAverageDepth: number | null;
  soilProjectDurationAmount: number | null;
  soilProjectDurationUnit: string | null;
  soilFillTypeToPlace: string | null;
  soilAlternativeMeasures: string | null;
  soilIsExtractionOrMining: boolean | null;
  soilHasSubmittedNotice: boolean | null;

  //NARU Fields
  naruSubtype: BaseCodeDto | null;
  naruPurpose: string | null;
  naruFloorArea: number | null;
  naruResidenceNecessity: string | null;
  naruLocationRationale: string | null;
  naruInfrastructure: string | null;
  naruExistingStructures: string | null;
  naruWillImportFill: boolean | null;
  naruFillType: string | null;
  naruFillOrigin: string | null;
  naruProjectDurationAmount: number | null;
  naruProjectDurationUnit: string | null;
  naruToPlaceVolume: number | null;
  naruToPlaceArea: number | null;
  naruToPlaceMaximumDepth: number | null;
  naruToPlaceAverageDepth: number | null;
  naruSleepingUnits: number | null;
  naruAgriTourism: string | null;
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
  region?: ApplicationRegionDto;
  localGovernment?: ApplicationLocalGovernmentDto;
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
  proposalExpiryDate?: number;
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
  proposalExpiryDate?: number;
}

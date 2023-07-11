import { BaseCodeDto } from '../../shared/dto/base.dto';
import { CardDto } from '../card/card.dto';
import { UserDto } from '../user/user.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from './application-code.dto';
import { ApplicationLocalGovernmentDto } from './application-local-government/application-local-government.dto';

export enum APPLICATION_SYSTEM_SOURCE_TYPES {
  APPLICANT = 'APPLICANT',
  ALCS = 'ALCS',
}

export enum PARCEL_OWNERSHIP_TYPE {
  FEE_SIMPLE = 'SMPL',
  CROWN = 'CRWN',
}

export enum APPLICATION_STATUS {
  IN_PROGRESS = 'PROG',
  SUBMITTED_TO_ALC = 'SUBM',
  SUBMITTED_TO_LG = 'SUBG',
  IN_REVIEW = 'REVW',
  REFUSED_TO_FORWARD = 'REFU',
  INCOMPLETE = 'INCM',
  WRONG_GOV = 'WRNG',
  CANCELLED = 'CANC',
  ALC_DECISION = 'ALCD',
  CEO_DECISION = 'CEOD',
}

// export interface StatusHistory {
//   type: 'status_change';
//   label: string;
//   description: string;
//   time: number;
// }

export interface ApplicationStatus extends BaseCodeDto {
  code: APPLICATION_STATUS;
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

export interface ApplicationParcelDto {
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
  owners: SubmittedApplicationOwnerDto[];
  alrArea: number;
}

export interface ApplicationSubmissionDto {
  uuid: string;
  fileNumber: string;
  createdAt: string;
  updatedAt: string;
  lastStatusUpdate: number;
  applicant: string;
  type: string;
  status: ApplicationStatus;
  typeCode: string;
  localGovernmentUuid: string;
  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
  owners: SubmittedApplicationOwnerDto[];
  hasOtherParcelsInCommunity?: boolean | null;
  returnedComment?: string;

  primaryContactOwnerUuid?: string;
  primaryContact?: SubmittedApplicationOwnerDto;

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

  //NFU Specific Fields
  nfuHectares: number | null;
  nfuPurpose: string | null;
  nfuOutsideLands: string | null;
  nfuAgricultureSupport: string | null;
  nfuWillImportFill: boolean | null;
  nfuTotalFillPlacement: number | null;
  nfuMaxFillDepth: number | null;
  nfuFillVolume: number | null;
  nfuProjectDurationAmount: number | null;
  nfuProjectDurationUnit: string | null;
  nfuFillTypeDescription: string | null;
  nfuFillOriginDescription: string | null;

  //TUR Fields
  turPurpose: string | null;
  turAgriculturalActivities: string | null;
  turReduceNegativeImpacts: string | null;
  turOutsideLands: string | null;
  turTotalCorridorArea: number | null;
  turAllOwnersNotified?: boolean | null;

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
  submittedApplication?: ApplicationSubmissionDto;
  source: APPLICATION_SYSTEM_SOURCE_TYPES;
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

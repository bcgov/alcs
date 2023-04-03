import { CardDto } from '../card/card.dto';
import { UserDto } from '../user/user.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from './application-code.dto';
import { ApplicationDocumentDto } from './application-document/application-document.dto';
import { ApplicationLocalGovernmentDto } from './application-local-government/application-local-government.dto';

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
  type: string;
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

  //NFU Data
  nfuHectares?: string;
  nfuPurpose?: string;
  nfuOutsideLands?: string;
  nfuAgricultureSupport?: string;
  nfuWillImportFill?: string;
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
  applicationReview?: ApplicationReviewDto;
  submittedApplication?: ApplicationSubmissionDto;
  source: 'ALCS' | 'APPLICANT';
  alrArea?: number;
  agCap?: string;
  agCapSource?: string;
  agCapMap?: string;
  agCapConsultant?: string;
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
}

import { BaseCodeDto } from '../../shared/dto/base.dto';
import { SYSTEM_SOURCE_TYPES } from '../../shared/dto/system-source.types.dto';
import { CardDto } from '../card/card.dto';
import { TagDto } from '../tag/tag.dto';
import { ProposedStructure } from '../notice-of-intent/notice-of-intent.dto';
import { UserDto } from '../user/user.dto';
import { ApplicationRegionDto, ApplicationTypeDto } from './application-code.dto';
import { ApplicationLocalGovernmentDto } from './application-local-government/application-local-government.dto';
import { ApplicationSubmissionToSubmissionStatusDto } from './application-submission-status/application-submission-status.dto';

export enum SUBMISSION_STATUS {
  IN_PROGRESS = 'PROG',
  INCOMPLETE = 'INCM', // L/FNG Returned as Incomplete
  WRONG_GOV = 'WRNG', //Wrong L/FNG
  SUBMITTED_TO_LG = 'SUBG', //Submitted to L/FNG
  IN_REVIEW_BY_LG = 'REVG', //new Under Review by L/FNG
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  SUBMITTED_TO_ALC_INCOMPLETE = 'SUIN', //Submitted to ALC - Incomplete
  RECEIVED_BY_ALC = 'RECA', //Received By ALC
  IN_REVIEW_BY_ALC = 'REVA', //Under Review by ALC
  ALC_DECISION = 'ALCD', // Decision Released
  REFUSED_TO_FORWARD_LG = 'RFFG', //L/FNG Refused to Forward
  RETURNED_TO_LG = 'INCG', //Returned to L/FNG from ALC
  CANCELLED = 'CANC', //Cancelled
}

export interface ApplicationStatus extends BaseCodeDto {
  code: SUBMISSION_STATUS;
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
  date: number;
}

export interface ProposedLot {
  type: 'Lot' | 'Road Dedication' | null;
  size: number | null;
  alrArea?: number | null;
  planNumbers: string | null;
  number: number;
  componentUuid: string;
}

export interface ExistingResidence {
  floorArea: number;
  description: string;
}

export interface ProposedResidence {
  floorArea: number;
  description: string;
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
  certificateOfTitleUuid?: string;
  owners: SubmittedApplicationOwnerDto[];
  alrArea: number;
}

export interface UpdateApplicationSubmissionDto {
  subProposedLots?: ProposedLot[];
  applicant?: string;
}

export interface ApplicationSubmissionDto {
  uuid: string;
  fileNumber: string;
  lastStatusUpdate: number;
  applicant: string;
  purpose: string | null;
  type: string;
  status: ApplicationStatus;
  typeCode: string;
  localGovernmentUuid: string;
  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
  owners: SubmittedApplicationOwnerDto[];
  hasOtherParcelsInCommunity?: boolean | null;
  otherParcelsDescription?: string | null;
  returnedComment?: string;
  returnedToLfngComment?: string;
  submissionStatuses: ApplicationSubmissionToSubmissionStatusDto[];

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
  nfuOutsideLands: string | null;
  nfuAgricultureSupport: string | null;
  nfuWillImportFill: boolean | null;
  nfuTotalFillArea: number | null;
  nfuMaxFillDepth: number | null;
  nfuAverageFillDepth: number | null;
  nfuFillVolume: number | null;
  nfuProjectDuration: string | null;
  nfuFillTypeDescription: string | null;
  nfuFillOriginDescription: string | null;

  //TUR Fields
  turAgriculturalActivities: string | null;
  turReduceNegativeImpacts: string | null;
  turOutsideLands: string | null;
  turTotalCorridorArea: number | null;
  turAllOwnersNotified?: boolean | null;

  //Subdivision Fields
  subdSuitability: string | null;
  subdAgricultureSupport: string | null;
  subdIsHomeSiteSeverance: boolean | null;
  subdProposedLots: ProposedLot[];

  //Soil Fields
  soilIsNewStructure: boolean | null;
  soilIsFollowUp: boolean | null;
  soilFollowUpIDs: string | null;
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
  soilProjectDuration: string | null;
  fillProjectDuration: string | null;
  soilFillTypeToPlace: string | null;
  soilAlternativeMeasures: string | null;
  soilIsExtractionOrMining: boolean | null;
  soilHasSubmittedNotice: boolean | null;
  soilStructureFarmUseReason: string | null;
  soilStructureResidentialUseReason: string | null;
  soilAgriParcelActivity: string | null;
  soilStructureResidentialAccessoryUseReason: string | null;
  soilStructureOtherUseReason: string | null;
  soilProposedStructures: ProposedStructure[];

  //NARU Fields
  naruWillBeOverFiveHundredM2: boolean | null;
  naruWillRetainResidence: boolean | null;
  naruWillHaveAdditionalResidence: boolean | null;
  naruWillHaveTemporaryForeignWorkerHousing: boolean | null;
  naruWillImportFill: boolean | null;
  tfwhCount: string | null;
  tfwhDesign: boolean | null;
  tfwhFarmSize: string | null;
  naruClustered: string | null;
  naruSetback: string | null;
  naruSubtype: BaseCodeDto | null;
  naruFloorArea: number | null;
  naruResidenceNecessity: string | null;
  naruLocationRationale: string | null;
  naruInfrastructure: string | null;
  naruExistingStructures: string | null;
  naruFillType: string | null;
  naruFillOrigin: string | null;
  naruProjectDuration: string | null;
  naruToPlaceVolume: number | null;
  naruToPlaceArea: number | null;
  naruToPlaceMaximumDepth: number | null;
  naruToPlaceAverageDepth: number | null;
  naruSleepingUnits: number | null;
  naruAgriTourism: string | null;
  naruExistingResidences?: ExistingResidence[];
  naruProposedResidences?: ProposedResidence[];

  //Inclusion / Exclusion Fields
  prescribedBody: string | null;
  inclExclHectares: number | null;
  exclWhyLand: string | null;
  inclAgricultureSupport: string | null;
  inclImprovements: string | null;
  exclShareGovernmentBorders: boolean | null;
  inclGovernmentOwnsAllParcels: boolean | null;

  //Covenant Fields
  coveHasDraft: boolean | null;
  coveFarmImpact: string | null;
  coveAreaImpacted: number | null;
}

export interface ApplicationDto {
  uuid: string;
  fileNumber: string;
  applicant: string;
  summary?: string;
  hideFromPortal: boolean;
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
  source: SYSTEM_SOURCE_TYPES;
  alrArea?: number;
  agCap?: string;
  agCapSource?: string;
  agCapMap?: string;
  agCapConsultant?: string;
  staffObservations?: string;
  nfuUseType?: string;
  nfuUseSubType?: string;
  inclExclApplicantType?: string;
  legacyId?: string;
  tags?: TagDto[];
}

export interface UpdateApplicationDto {
  dateSubmittedToAlc?: number;
  applicant?: string;
  hideFromPortal?: boolean;
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
  inclExclApplicantType?: string;
}

export interface CovenantTransfereeDto {
  uuid: string;
  applicationSubmissionUuid: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
  phoneNumber: string | null;
  email: string | null;
  type: BaseCodeDto;
}

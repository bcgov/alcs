import { BaseCodeDto } from '../../shared/dto/base.dto';
import { ApplicationOwnerDetailedDto } from '../application-owner/application-owner.dto';

export enum SUBMISSION_STATUS {
  IN_PROGRESS = 'PROG',
  INCOMPLETE = 'INCM', // L/FNG Returned as Incomplete
  WRONG_GOV = 'WRNG', //Wrong L/FNG
  SUBMITTED_TO_LG = 'SUBG', //Submitted to L/FNG
  IN_REVIEW_BY_LG = 'REVG', //new Under Review by L/FNG
  SUBMITTED_TO_ALC = 'SUBM', //Submitted to ALC
  SUBMITTED_TO_ALC_INCOMPLETE = 'SUIN', //new Submitted to ALC - Incomplete
  RECEIVED_BY_ALC = 'RECA', //new Received By ALC
  IN_REVIEW_BY_ALC = 'REVA', //new Under Review by ALC
  ALC_DECISION = 'ALCD', // Decision Released
  REFUSED_TO_FORWARD_LG = 'RFFG', //new L/FNG Refused to Forward
  RETURNED_TO_LG = 'INCG', //Returned to L/FNG from ALC
  CANCELLED = 'CANC',
}

export interface ApplicationStatusDto extends BaseCodeDto {
  code: SUBMISSION_STATUS;
  portalBackgroundColor: string;
  portalColor: string;
}

export interface ApplicationSubmissionToSubmissionStatusDto {
  submissionUuid: string;
  effectiveDate: number | null;
  statusTypeCode: string;
  status: ApplicationStatusDto;
}

export interface NaruSubtypeDto extends BaseCodeDto {}

export interface ProposedLot {
  type: 'Lot' | 'Road Dedication' | null;
  size: number | null;
}

export interface ApplicationSubmissionDto {
  uuid: string;
  fileNumber: string;
  createdAt: number;
  updatedAt: number;
  lastStatusUpdate: number;
  applicant: string;
  purpose: string | null;
  type: string;
  typeCode: string;
  requiresGovernmentReview: boolean;
  localGovernmentUuid: string;
  status: ApplicationStatusDto;
  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
  owners: ApplicationOwnerDetailedDto[];
  hasOtherParcelsInCommunity?: boolean | null;
  returnedComment?: string;
  returnedToLfngComment?: string;
  submissionStatuses: ApplicationSubmissionToSubmissionStatusDto[];
}

export interface ApplicationSubmissionDetailedDto extends ApplicationSubmissionDto {
  primaryContactOwnerUuid?: string;
  otherParcelsDescription?: string | null;

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
  soilIsExtractionOrMining: boolean;
  soilHasSubmittedNotice: boolean;

  //NARU Fields
  naruWillBeOverFiveHundredM2: boolean | null;
  naruWillRetainResidence: boolean | null;
  naruWillHaveAdditionalResidence: boolean | null;
  naruWillHaveTemporaryForeignWorkerHousing: boolean | null;
  naruWillImportFill: boolean | null;
  naruClustered: string | null;
  naruSetback: string | null;
  naruSubtype: NaruSubtypeDto | null;
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

export interface ApplicationSubmissionUpdateDto {
  applicant?: string;
  purpose?: string | null;
  localGovernmentUuid?: string;
  typeCode?: string;
  primaryContactOwnerUuid?: string;
  hasOtherParcelsInCommunity?: boolean | null;
  otherParcelsDescription?: string | null;

  //Land use fields
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
  nfuHectares?: number | null;
  nfuOutsideLands?: string | null;
  nfuAgricultureSupport?: string | null;
  nfuWillImportFill?: boolean | null;
  nfuTotalFillArea?: number | null;
  nfuMaxFillDepth?: number | null;
  nfuAverageFillDepth?: number | null;
  nfuFillVolume?: number | null;
  nfuProjectDuration?: string | null;
  nfuFillTypeDescription?: string | null;
  nfuFillOriginDescription?: string | null;

  //TUR Fields
  turAgriculturalActivities?: string | null;
  turReduceNegativeImpacts?: string | null;
  turOutsideLands?: string | null;
  turTotalCorridorArea?: number | null;
  turAllOwnersNotified?: boolean | null;

  //Subdivision Fields
  subdSuitability?: string | null;
  subdAgricultureSupport?: string | null;
  subdIsHomeSiteSeverance?: boolean | null;
  subdProposedLots?: ProposedLot[];

  //Soil Fields
  soilIsFollowUp?: boolean | null;
  soilFollowUpIDs?: string | null;
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
  soilProjectDuration?: string | null;
  fillProjectDuration?: string | null;
  soilFillTypeToPlace?: string | null;
  soilAlternativeMeasures?: string | null;
  soilIsExtractionOrMining?: boolean | null;
  soilHasSubmittedNotice?: boolean | null;

  //NARU Fields
  naruWillBeOverFiveHundredM2?: boolean | null;
  naruWillRetainResidence?: boolean | null;
  naruWillHaveAdditionalResidence?: boolean | null;
  naruWillHaveTemporaryForeignWorkerHousing?: boolean | null;
  naruWillImportFill?: boolean | null;
  naruClustered?: string | null;
  naruSetback?: string | null;
  naruSubtypeCode?: string | null;
  naruFloorArea?: number | null;
  naruResidenceNecessity?: string | null;
  naruLocationRationale?: string | null;
  naruInfrastructure?: string | null;
  naruExistingStructures?: string | null;
  naruFillType?: string | null;
  naruFillOrigin?: string | null;
  naruProjectDuration?: string | null;
  naruToPlaceVolume?: number | null;
  naruToPlaceArea?: number | null;
  naruToPlaceMaximumDepth?: number | null;
  naruToPlaceAverageDepth?: number | null;
  naruSleepingUnits?: number | null;
  naruAgriTourism?: string | null;

  //Inclusion / Exclusion Fields
  prescribedBody?: string | null;
  inclExclHectares?: number | null;
  exclWhyLand?: string | null;
  inclAgricultureSupport?: string | null;
  inclImprovements?: string | null;
  exclShareGovernmentBorders?: boolean | null;
  inclGovernmentOwnsAllParcels?: boolean | null;

  //Covenant Fields
  coveHasDraft?: boolean | null;
  coveFarmImpact?: string | null;
  coveAreaImpacted?: number | null;
}

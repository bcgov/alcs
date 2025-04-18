import { ApplicationPortalDecisionDto } from '../application-decision/application-decision.dto';
import {
  ApplicationStatusDto,
  NaruSubtypeDto,
  ProposedLot,
} from '../application-submission/application-submission.dto';
import { ProposedStructure } from '../notice-of-intent-submission/notice-of-intent-submission.dto';
import { PublicDocumentDto, PublicOwnerDto, PublicParcelDto } from './public.dto';

export interface ExistingResidence {
  floorArea: number;
  description: string;
}

export interface ProposedResidence {
  floorArea: number;
  description: string;
}

export interface GetPublicApplicationResponseDto {
  submission: PublicApplicationSubmissionDto;
  parcels: PublicParcelDto[];
  documents: PublicDocumentDto[];
  review?: PublicApplicationSubmissionReviewDto;
  decisions: ApplicationPortalDecisionDto[];
  transferees: PublicOwnerDto[];
}

export interface PublicApplicationSubmissionDto {
  fileNumber: string;
  uuid: string;
  createdAt: number;
  updatedAt: number;
  applicant: string;
  localGovernmentUuid: string;
  lastStatusUpdate: number;
  status: ApplicationStatusDto;
  owners: PublicOwnerDto[];
  type: string;
  typeCode: string;
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
  primaryContactOwnerUuid?: string | null;

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
  soilProjectDuration?: string | null;
  fillProjectDuration: string | null;
  soilFillTypeToPlace?: string | null;
  soilAlternativeMeasures?: string | null;
  soilIsExtractionOrMining?: boolean;
  soilHasSubmittedNotice?: boolean;
  soilStructureFarmUseReason?: string | null;
  soilStructureResidentialUseReason?: string | null;
  soilAgriParcelActivity?: string | null;
  soilStructureResidentialAccessoryUseReason?: string | null;
  soilStructureOtherUseReason?: string | null;
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
  naruExistingResidences?: ExistingResidence[];
  naruProposedResidences?: ProposedResidence[];

  //Inclusion / Exclusion Fields
  prescribedBody: string | null;
  inclExclHectares: number | null;
  exclWhyLand: string | null;
  inclAgricultureSupport: string | null;
  inclImprovements: string | null;
  exclShareGovernmentBorders: boolean | null;
  inclGovernmentOwnsAllParcels?: boolean | null;

  //Covenant Fields
  coveFarmImpact: string | null;
  coveAreaImpacted: number | null;
}

export interface PublicApplicationSubmissionReviewDto {
  applicationFileNumber: string;
  localGovernmentFileNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  department: string | null;
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

import { BaseCodeDto } from '../../shared/dto/base.dto';
import { DocumentTypeDto } from '../../shared/dto/document.dto';
import { OwnerTypeDto } from '../../shared/dto/owner.dto';
import { ApplicationPortalDecisionDto } from '../application-decision/application-decision.dto';
import {
  ApplicationStatusDto,
  NaruSubtypeDto,
  ProposedLot,
} from '../application-submission/application-submission.dto';

export interface GetPublicApplicationResponseDto {
  submission: PublicApplicationSubmissionDto;
  parcels: PublicApplicationParcelDto[];
  documents: PublicDocumentDto[];
  review?: PublicApplicationSubmissionReviewDto;
  decisions: ApplicationPortalDecisionDto[];
}

export interface PublicOwnerDto {
  uuid: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  type: OwnerTypeDto;
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
  nfuProjectDurationAmount?: number | null;
  nfuProjectDurationUnit?: string | null;
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
  soilProjectDurationAmount: number | null;
  soilProjectDurationUnit?: string | null;
  soilFillTypeToPlace?: string | null;
  soilAlternativeMeasures?: string | null;
  soilIsExtractionOrMining?: boolean;
  soilHasSubmittedNotice?: boolean;

  //NARU Fields
  naruSubtype: NaruSubtypeDto | null;
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

  //Inclusion / Exclusion Fields
  prescribedBody: string | null;
  inclExclHectares: number | null;
  exclWhyLand: string | null;
  inclAgricultureSupport: string | null;
  inclImprovements: string | null;
  exclShareGovernmentBorders: boolean | null;
  inclGovernmentOwnsAllParcels?: boolean | null;
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

export interface PublicApplicationParcelDto {
  uuid: string;
  pid?: string | null;
  pin?: string | null;
  legalDescription?: string | null;
  civicAddress?: string | null;
  mapAreaHectares?: number | null;
  purchasedDate?: number | null;
  isFarm?: boolean | null;
  ownershipTypeCode?: string | null;
  crownLandOwnerType?: string | null;
  ownershipType?: BaseCodeDto;
  parcelType: string;
  alrArea: number | null;
  owners: PublicOwnerDto[];
}

export interface PublicDocumentDto {
  description?: string;
  uuid: string;
  type?: DocumentTypeDto;
  documentUuid: string;
  fileName: string;
  fileSize?: number;
  mimeType: string;
  uploadedAt: number;
}

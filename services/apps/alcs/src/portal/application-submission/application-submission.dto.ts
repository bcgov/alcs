import { AutoMap } from 'automapper-classes';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  ApplicationStatusDto,
  ApplicationSubmissionToSubmissionStatusDto,
} from '../../alcs/application/application-submission-status/submission-status.dto';
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { ApplicationOwnerDto } from './application-owner/application-owner.dto';
import {
  ExistingResidence,
  ProposedLot,
  ProposedResidence,
} from './application-submission.entity';

export const MAX_DESCRIPTION_FIELD_LENGTH = 4000;
export const MAX_LANDUSE_FIELD_LENGTH = 500;
export const MAX_PROJECT_DURATION_FIELD_LENGTH = 500;

export class NaruSubtypeDto extends BaseCodeDto {}

export class ApplicationSubmissionDto {
  @AutoMap()
  fileNumber: string;

  @AutoMap()
  uuid: string;

  @AutoMap()
  createdAt: number;

  @AutoMap()
  updatedAt: number;

  @AutoMap()
  applicant: string;

  @AutoMap()
  localGovernmentUuid: string;

  status: ApplicationStatusDto;

  @AutoMap(() => Boolean)
  hasOtherParcelsInCommunity?: boolean | null;

  @AutoMap(() => String)
  returnedComment: string | null;

  @AutoMap(() => String)
  returnedToLfngComment: string | null;

  lastStatusUpdate: number;
  owners: ApplicationOwnerDto[];
  type: string;
  requiresGovernmentReview: boolean;

  @AutoMap()
  typeCode: string;

  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
}

export class ApplicationSubmissionDetailedDto extends ApplicationSubmissionDto {
  @AutoMap(() => String)
  purpose: string | null;
  @AutoMap(() => String)
  otherParcelsDescription?: string | null;
  @AutoMap()
  parcelsAgricultureDescription: string;
  @AutoMap()
  parcelsAgricultureImprovementDescription: string;
  @AutoMap()
  parcelsNonAgricultureUseDescription: string;
  @AutoMap()
  northLandUseType: string;
  @AutoMap()
  northLandUseTypeDescription: string;
  @AutoMap()
  eastLandUseType: string;
  @AutoMap()
  eastLandUseTypeDescription: string;
  @AutoMap()
  southLandUseType: string;
  @AutoMap()
  southLandUseTypeDescription: string;
  @AutoMap()
  westLandUseType: string;
  @AutoMap()
  westLandUseTypeDescription: string;
  @AutoMap(() => String)
  primaryContactOwnerUuid?: string | null;

  //NFU Specific Fields
  @AutoMap(() => Number)
  nfuHectares?: number | null;

  @AutoMap(() => String)
  nfuOutsideLands?: string | null;

  @AutoMap(() => String)
  nfuAgricultureSupport?: string | null;

  @AutoMap(() => String)
  nfuWillImportFill?: boolean | null;

  @AutoMap(() => Number)
  nfuTotalFillArea?: number | null;

  @AutoMap(() => Number)
  nfuMaxFillDepth?: number | null;

  @AutoMap(() => Number)
  nfuAverageFillDepth?: number | null;

  @AutoMap(() => Number)
  nfuFillVolume?: number | null;

  @AutoMap(() => String)
  nfuProjectDuration?: string | null;

  @AutoMap(() => String)
  nfuFillTypeDescription?: string | null;

  @AutoMap(() => String)
  nfuFillOriginDescription?: string | null;

  //TUR Fields
  @AutoMap(() => String)
  turAgriculturalActivities?: string | null;

  @AutoMap(() => String)
  turReduceNegativeImpacts?: string | null;

  @AutoMap(() => String)
  turOutsideLands?: string | null;

  @AutoMap(() => Number)
  turTotalCorridorArea?: number | null;

  @AutoMap(() => Boolean)
  turAllOwnersNotified?: boolean | null;

  //Subdivision Fields
  @AutoMap(() => String)
  subdSuitability?: string | null;

  @AutoMap(() => String)
  subdAgricultureSupport?: string | null;

  @AutoMap(() => Boolean)
  subdIsHomeSiteSeverance?: boolean | null;

  @AutoMap(() => [ProposedLot])
  subdProposedLots?: ProposedLot[];

  //Soil Fields
  @AutoMap(() => Boolean)
  soilIsFollowUp: boolean | null;

  @AutoMap(() => String)
  soilFollowUpIDs: string | null;

  @AutoMap(() => String)
  soilTypeRemoved: string | null;

  @AutoMap(() => String)
  soilReduceNegativeImpacts: string | null;

  @AutoMap(() => Number)
  soilToRemoveVolume: number | null;

  @AutoMap(() => Number)
  soilToRemoveArea: number | null;

  @AutoMap(() => Number)
  soilToRemoveMaximumDepth: number | null;

  @AutoMap(() => Number)
  soilToRemoveAverageDepth: number | null;

  @AutoMap(() => Number)
  soilAlreadyRemovedVolume: number | null;

  @AutoMap(() => Number)
  soilAlreadyRemovedArea: number | null;

  @AutoMap(() => Number)
  soilAlreadyRemovedMaximumDepth: number | null;

  @AutoMap(() => Number)
  soilAlreadyRemovedAverageDepth: number | null;

  @AutoMap(() => Number)
  soilToPlaceVolume: number | null;

  @AutoMap(() => Number)
  soilToPlaceArea: number | null;

  @AutoMap(() => Number)
  soilToPlaceMaximumDepth: number | null;

  @AutoMap(() => Number)
  soilToPlaceAverageDepth: number | null;

  @AutoMap(() => Number)
  soilAlreadyPlacedVolume: number | null;

  @AutoMap(() => Number)
  soilAlreadyPlacedArea: number | null;

  @AutoMap(() => Number)
  soilAlreadyPlacedMaximumDepth: number | null;

  @AutoMap(() => Number)
  soilAlreadyPlacedAverageDepth: number | null;

  @AutoMap(() => String)
  soilProjectDuration?: string | null;

  @AutoMap(() => String)
  fillProjectDuration: string | null;

  @AutoMap(() => String)
  soilFillTypeToPlace?: string | null;

  @AutoMap(() => String)
  soilAlternativeMeasures?: string | null;

  @AutoMap(() => Boolean)
  soilIsExtractionOrMining?: boolean;

  @AutoMap(() => Boolean)
  soilHasSubmittedNotice?: boolean;

  @AutoMap(() => Boolean)
  naruWillBeOverFiveHundredM2: boolean | null;

  @AutoMap(() => Boolean)
  naruWillRetainResidence: boolean | null;

  @AutoMap(() => Boolean)
  naruWillHaveAdditionalResidence: boolean | null;

  @AutoMap(() => Boolean)
  naruWillHaveTemporaryForeignWorkerHousing: boolean | null;

  @AutoMap(() => Boolean)
  naruWillImportFill: boolean | null;

  @AutoMap(() => String)
  naruClustered: string | null;

  @AutoMap(() => String)
  naruSetback: string | null;

  //NARU Fields
  @AutoMap(() => [NaruSubtypeDto])
  naruSubtype: NaruSubtypeDto | null;

  @AutoMap(() => Number)
  naruFloorArea: number | null;

  @AutoMap(() => String)
  naruResidenceNecessity: string | null;

  @AutoMap(() => String)
  naruLocationRationale: string | null;

  @AutoMap(() => String)
  naruInfrastructure: string | null;

  @AutoMap(() => String)
  naruExistingStructures: string | null;

  @AutoMap(() => String)
  naruFillType: string | null;

  @AutoMap(() => String)
  naruFillOrigin: string | null;

  @AutoMap(() => String)
  naruProjectDuration: string | null;

  @AutoMap(() => Number)
  naruToPlaceVolume: number | null;

  @AutoMap(() => Number)
  naruToPlaceArea: number | null;

  @AutoMap(() => Number)
  naruToPlaceMaximumDepth: number | null;

  @AutoMap(() => Number)
  naruToPlaceAverageDepth: number | null;

  @AutoMap(() => Number)
  naruSleepingUnits: number | null;

  @AutoMap(() => String)
  naruAgriTourism: string | null;

  @AutoMap(() => ExistingResidence)
  naruExistingResidences?: ExistingResidence[];

  @AutoMap(() => ProposedResidence)
  naruProposedResidences?: ProposedResidence[];

  @AutoMap(() => ApplicationSubmissionToSubmissionStatusDto)
  submissionStatuses: ApplicationSubmissionToSubmissionStatusDto[];

  //Inclusion / Exclusion Fields
  @AutoMap(() => String)
  prescribedBody: string | null;

  @AutoMap(() => Number)
  inclExclHectares: number | null;

  @AutoMap(() => String)
  exclWhyLand: string | null;

  @AutoMap(() => String)
  inclAgricultureSupport: string | null;

  @AutoMap(() => String)
  inclImprovements: string | null;

  @AutoMap(() => Boolean)
  exclShareGovernmentBorders: boolean | null;

  @AutoMap(() => Boolean)
  inclGovernmentOwnsAllParcels?: boolean | null;

  //Covenant Fields
  @AutoMap(() => Boolean)
  coveHasDraft: boolean | null;

  @AutoMap(() => String)
  coveFarmImpact: string | null;

  @AutoMap(() => Number)
  coveAreaImpacted: number | null;
}

export class ApplicationSubmissionCreateDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  prescribedBody?: string;
}

export class ApplicationSubmissionUpdateDto {
  @IsString()
  @IsOptional()
  applicant?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  purpose?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  otherParcelsDescription?: string | null;

  @IsUUID()
  @IsOptional()
  localGovernmentUuid?: string;

  @IsString()
  @IsOptional()
  typeCode?: string;

  @IsString()
  @IsOptional()
  returnedComment?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  parcelsAgricultureDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  parcelsAgricultureImprovementDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  parcelsNonAgricultureUseDescription?: string;

  @IsString()
  @IsOptional()
  northLandUseType?: string;

  @IsString()
  @MaxLength(MAX_LANDUSE_FIELD_LENGTH)
  @IsOptional()
  northLandUseTypeDescription?: string;

  @IsString()
  @IsOptional()
  eastLandUseType?: string;

  @IsString()
  @MaxLength(MAX_LANDUSE_FIELD_LENGTH)
  @IsOptional()
  eastLandUseTypeDescription?: string;

  @IsString()
  @IsOptional()
  southLandUseType?: string;

  @IsString()
  @MaxLength(MAX_LANDUSE_FIELD_LENGTH)
  @IsOptional()
  southLandUseTypeDescription?: string;

  @IsString()
  @IsOptional()
  westLandUseType?: string;

  @IsString()
  @MaxLength(MAX_LANDUSE_FIELD_LENGTH)
  @IsOptional()
  westLandUseTypeDescription?: string;

  @IsBoolean()
  @IsOptional()
  hasOtherParcelsInCommunity?: boolean | null;

  //NFU Specific Fields
  @IsNumber()
  @IsOptional()
  nfuHectares?: number | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  nfuOutsideLands?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  nfuAgricultureSupport?: string | null;

  @IsBoolean()
  @IsOptional()
  nfuWillImportFill?: boolean | null;

  @IsNumber()
  @IsOptional()
  nfuTotalFillArea?: number | null;

  @IsNumber()
  @IsOptional()
  nfuMaxFillDepth?: number | null;

  @IsNumber()
  @IsOptional()
  nfuAverageFillDepth?: number | null;

  @IsNumber()
  @IsOptional()
  nfuFillVolume?: number | null;

  @IsString()
  @MaxLength(MAX_PROJECT_DURATION_FIELD_LENGTH)
  @IsOptional()
  nfuProjectDuration?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  nfuFillTypeDescription?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  nfuFillOriginDescription?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  turAgriculturalActivities?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  turReduceNegativeImpacts?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  turOutsideLands?: string | null;

  @IsNumber()
  @IsOptional()
  turTotalCorridorArea?: number | null;

  @IsBoolean()
  @IsOptional()
  turAllOwnersNotified?: boolean | null;

  //Subdivision Fields
  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  subdSuitability?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  subdAgricultureSupport?: string | null;

  @IsBoolean()
  @IsOptional()
  subdIsHomeSiteSeverance?: boolean | null;

  @IsArray()
  @IsOptional()
  subdProposedLots?: ProposedLot[];

  //Soil Fields
  @IsBoolean()
  @IsOptional()
  soilIsFollowUp?: boolean | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  soilFollowUpIDs?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  soilTypeRemoved?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  soilReduceNegativeImpacts?: string | null;

  @IsNumber()
  @IsOptional()
  soilToRemoveVolume?: number | null;

  @IsNumber()
  @IsOptional()
  soilToRemoveArea?: number | null;

  @IsNumber()
  @IsOptional()
  soilToRemoveMaximumDepth?: number | null;

  @IsNumber()
  @IsOptional()
  soilToRemoveAverageDepth?: number | null;

  @IsNumber()
  @IsOptional()
  soilAlreadyRemovedVolume?: number | null;

  @IsNumber()
  @IsOptional()
  soilAlreadyRemovedArea?: number | null;

  @IsNumber()
  @IsOptional()
  soilAlreadyRemovedMaximumDepth?: number | null;

  @IsNumber()
  @IsOptional()
  soilAlreadyRemovedAverageDepth?: number | null;

  @IsNumber()
  @IsOptional()
  soilToPlaceVolume?: number | null;

  @IsNumber()
  @IsOptional()
  soilToPlaceArea?: number | null;

  @IsNumber()
  @IsOptional()
  soilToPlaceMaximumDepth?: number | null;

  @IsNumber()
  @IsOptional()
  soilToPlaceAverageDepth?: number | null;

  @IsNumber()
  @IsOptional()
  soilAlreadyPlacedVolume?: number | null;

  @IsNumber()
  @IsOptional()
  soilAlreadyPlacedArea?: number | null;

  @IsNumber()
  @IsOptional()
  soilAlreadyPlacedMaximumDepth?: number | null;

  @IsNumber()
  @IsOptional()
  soilAlreadyPlacedAverageDepth?: number | null;

  @IsString()
  @MaxLength(MAX_PROJECT_DURATION_FIELD_LENGTH)
  @IsOptional()
  soilProjectDuration?: string | null;

  @IsString()
  @MaxLength(MAX_PROJECT_DURATION_FIELD_LENGTH)
  @IsOptional()
  fillProjectDuration?: string | null;

  @IsString()
  @IsOptional()
  soilFillTypeToPlace?: string | null;

  @IsString()
  @IsOptional()
  soilAlternativeMeasures?: string | null;

  @IsBoolean()
  @IsOptional()
  soilIsExtractionOrMining?: boolean;

  @IsBoolean()
  @IsOptional()
  soilHasSubmittedNotice?: boolean;

  //NARU Fields
  @IsBoolean()
  @IsOptional()
  naruWillBeOverFiveHundredM2?: boolean | null;

  @IsBoolean()
  @IsOptional()
  naruWillRetainResidence?: boolean | null;

  @IsBoolean()
  @IsOptional()
  naruWillHaveAdditionalResidence?: boolean | null;

  @IsBoolean()
  @IsOptional()
  naruWillHaveTemporaryForeignWorkerHousing?: boolean | null;

  @IsBoolean()
  @IsOptional()
  naruWillImportFill?: boolean | null;

  @IsString()
  @IsOptional()
  naruClustered?: string | null;

  @IsString()
  @IsOptional()
  naruSetback?: string | null;

  @IsString()
  @IsOptional()
  naruSubtypeCode?: string | null;

  @IsNumber()
  @IsOptional()
  naruFloorArea?: number | null;

  @IsString()
  @IsOptional()
  naruResidenceNecessity?: string | null;

  @IsString()
  @IsOptional()
  naruLocationRationale?: string | null;

  @IsString()
  @IsOptional()
  naruInfrastructure?: string | null;

  @IsString()
  @IsOptional()
  naruExistingStructures?: string | null;

  @IsString()
  @IsOptional()
  naruFillType?: string | null;

  @IsString()
  @IsOptional()
  naruFillOrigin?: string | null;

  @IsString()
  @MaxLength(MAX_PROJECT_DURATION_FIELD_LENGTH)
  @IsOptional()
  naruProjectDuration?: string | null;

  @IsNumber()
  @IsOptional()
  naruToPlaceVolume?: number | null;

  @IsNumber()
  @IsOptional()
  naruToPlaceArea?: number | null;

  @IsNumber()
  @IsOptional()
  naruToPlaceMaximumDepth?: number | null;

  @IsNumber()
  @IsOptional()
  naruToPlaceAverageDepth?: number | null;

  @IsNumber()
  @IsOptional()
  naruSleepingUnits?: number | null;

  @IsString()
  @IsOptional()
  naruAgriTourism?: string | null;

  @IsArray()
  @IsOptional()
  naruExistingResidences?: ExistingResidence[];

  @IsArray()
  @IsOptional()
  naruProposedResidences?: ExistingResidence[];

  //Inclusion / Exclusion Fields
  @IsString()
  @IsOptional()
  prescribedBody?: string | null;

  @IsNumber()
  @IsOptional()
  inclExclHectares?: number | null;

  @IsString()
  @IsOptional()
  exclWhyLand?: string | null;

  @IsString()
  @IsOptional()
  inclAgricultureSupport?: string | null;

  @IsString()
  @IsOptional()
  inclImprovements?: string | null;

  @IsBoolean()
  @IsOptional()
  exclShareGovernmentBorders?: boolean | null;

  @IsBoolean()
  @IsOptional()
  inclGovernmentOwnsAllParcels?: boolean | null;

  //Covenant Fields
  @IsBoolean()
  @IsOptional()
  coveHasDraft?: boolean | null;

  @IsString()
  @IsOptional()
  coveFarmImpact?: string | null;

  @IsNumber()
  @IsOptional()
  coveAreaImpacted?: number | null;
}

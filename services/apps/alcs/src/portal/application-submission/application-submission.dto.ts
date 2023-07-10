import { AutoMap } from '@automapper/classes';
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
import { BaseCodeDto } from '../../common/dtos/base.dto';
import { ApplicationOwnerDto } from './application-owner/application-owner.dto';
import { ProposedLot } from './application-submission.entity';
import { ApplicationStatusDto } from './submission-status/submission-status.dto';

export const MAX_DESCRIPTION_FIELD_LENGTH = 4000;

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

  @AutoMap()
  status: ApplicationStatusDto;

  @AutoMap(() => Boolean)
  hasOtherParcelsInCommunity?: boolean | null;

  @AutoMap(() => String)
  returnedComment: string | null;

  lastStatusUpdate: number;
  owners: ApplicationOwnerDto[];
  type: string;

  @AutoMap()
  typeCode: string;

  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
}

export class ApplicationSubmissionDetailedDto extends ApplicationSubmissionDto {
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
  nfuPurpose?: string | null;

  @AutoMap(() => String)
  nfuOutsideLands?: string | null;

  @AutoMap(() => String)
  nfuAgricultureSupport?: string | null;

  @AutoMap(() => String)
  nfuWillImportFill?: boolean | null;

  @AutoMap(() => Number)
  nfuTotalFillPlacement?: number | null;

  @AutoMap(() => Number)
  nfuMaxFillDepth?: number | null;

  @AutoMap(() => Number)
  nfuFillVolume?: number | null;

  @AutoMap(() => Number)
  nfuProjectDurationAmount?: number | null;

  @AutoMap(() => String)
  nfuProjectDurationUnit?: string | null;

  @AutoMap(() => String)
  nfuFillTypeDescription?: string | null;

  @AutoMap(() => String)
  nfuFillOriginDescription?: string | null;

  //TUR Fields
  @AutoMap(() => String)
  turPurpose?: string | null;

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
  subdPurpose?: string | null;

  @AutoMap(() => String)
  subdSuitability?: string | null;

  @AutoMap(() => String)
  subdAgricultureSupport?: string | null;

  @AutoMap(() => Boolean)
  subdIsHomeSiteSeverance?: boolean | null;

  subdProposedLots?: ProposedLot[];

  //Soil Fields
  @AutoMap(() => Boolean)
  soilIsNOIFollowUp: boolean | null;

  @AutoMap(() => String)
  soilNOIIDs: string | null;

  @AutoMap(() => Boolean)
  soilHasPreviousALCAuthorization: boolean | null;

  @AutoMap(() => String)
  soilApplicationIDs: string | null;

  @AutoMap(() => String)
  soilPurpose: string | null;

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

  @AutoMap(() => Number)
  soilProjectDurationAmount: number | null;

  @AutoMap(() => String)
  soilProjectDurationUnit?: string | null;

  @AutoMap(() => String)
  soilFillTypeToPlace?: string | null;

  @AutoMap(() => String)
  soilAlternativeMeasures?: string | null;

  @AutoMap(() => Boolean)
  soilIsExtractionOrMining?: boolean;

  @AutoMap(() => Boolean)
  soilHasSubmittedNotice?: boolean;

  //NARU Fields
  @AutoMap(() => [NaruSubtypeDto])
  naruSubtype: NaruSubtypeDto | null;

  @AutoMap(() => String)
  naruPurpose: string | null;

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

  @AutoMap(() => Boolean)
  naruWillImportFill: boolean | null;

  @AutoMap(() => String)
  naruFillType: string | null;

  @AutoMap(() => String)
  naruFillOrigin: string | null;

  @AutoMap(() => Number)
  naruProjectDurationAmount: number | null;

  @AutoMap(() => String)
  naruProjectDurationUnit: string | null;

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
}

export class ApplicationSubmissionCreateDto {
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class ApplicationSubmissionUpdateDto {
  @IsString()
  @IsOptional()
  applicant?: string;

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
  @IsOptional()
  northLandUseTypeDescription?: string;

  @IsString()
  @IsOptional()
  eastLandUseType?: string;

  @IsString()
  @IsOptional()
  eastLandUseTypeDescription?: string;

  @IsString()
  @IsOptional()
  southLandUseType?: string;

  @IsString()
  @IsOptional()
  southLandUseTypeDescription?: string;

  @IsString()
  @IsOptional()
  westLandUseType?: string;

  @IsString()
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
  nfuPurpose?: string | null;

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
  nfuTotalFillPlacement?: number | null;

  @IsNumber()
  @IsOptional()
  nfuMaxFillDepth?: number | null;

  @IsNumber()
  @IsOptional()
  nfuFillVolume?: number | null;

  @IsNumber()
  @IsOptional()
  nfuProjectDurationAmount?: number | null;

  @IsString()
  @IsOptional()
  nfuProjectDurationUnit?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  nfuFillTypeDescription?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  nfuFillOriginDescription?: string | null;

  //TUR Fields
  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  turPurpose?: string | null;

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
  subdPurpose?: string | null;

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
  soilIsNOIFollowUp?: boolean | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  soilNOIIDs?: string | null;

  @IsBoolean()
  @IsOptional()
  soilHasPreviousALCAuthorization?: boolean | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  soilApplicationIDs?: string | null;

  @IsString()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  @IsOptional()
  soilPurpose?: string | null;

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

  @IsNumber()
  @IsOptional()
  soilProjectDurationAmount?: number | null;

  @IsString()
  @IsOptional()
  soilProjectDurationUnit?: string | null;

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
  @IsString()
  @IsOptional()
  naruSubtypeCode?: string | null;

  @IsString()
  @IsOptional()
  naruPurpose?: string | null;

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

  @IsBoolean()
  @IsOptional()
  naruWillImportFill?: boolean | null;

  @IsString()
  @IsOptional()
  naruFillType?: string | null;

  @IsString()
  @IsOptional()
  naruFillOrigin?: string | null;

  @IsNumber()
  @IsOptional()
  naruProjectDurationAmount?: number | null;

  @IsString()
  @IsOptional()
  naruProjectDurationUnit?: string | null;

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
}

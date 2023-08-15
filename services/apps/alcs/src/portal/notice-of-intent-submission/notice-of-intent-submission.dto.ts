import { AutoMap } from '@automapper/classes';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { NoticeOfIntentStatusDto } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentOwnerDto } from './notice-of-intent-owner/notice-of-intent-owner.dto';

export const MAX_DESCRIPTION_FIELD_LENGTH = 4000;

export class NoticeOfIntentSubmissionDto {
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
  type: string;

  @AutoMap()
  typeCode: string;

  status: NoticeOfIntentStatusDto;
  owners: NoticeOfIntentOwnerDto[];

  canEdit: boolean;
  canView: boolean;
}

export class NoticeOfIntentSubmissionDetailedDto extends NoticeOfIntentSubmissionDto {
  @AutoMap(() => String)
  purpose: string | null;
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
}

export class NoticeOfIntentSubmissionCreateDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  prescribedBody?: string;
}

export class NoticeOfIntentSubmissionUpdateDto {
  @IsString()
  @IsOptional()
  applicant?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_DESCRIPTION_FIELD_LENGTH)
  purpose?: string;

  @IsUUID()
  @IsOptional()
  localGovernmentUuid?: string;

  @IsString()
  @IsOptional()
  typeCode?: string;

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
}

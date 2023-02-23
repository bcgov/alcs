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
import { ApplicationDocumentDto } from './application-document/application-document.dto';
import { ApplicationOwnerDto } from './application-owner/application-owner.dto';
import { ApplicationStatusDto } from './application-status/application-status.dto';

export const MAX_DESCRIPTION_FIELD_LENGTH = 4000;

export class ApplicationDto {
  @AutoMap()
  fileNumber: string;

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

  documents: ApplicationDocumentDto[];
  owners: ApplicationOwnerDto[];

  type: string;

  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
}

export class ApplicationDetailedDto extends ApplicationDto {
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

  @AutoMap(() => String)
  primaryContactOwnerUuid?: string | null;
}

export class ApplicationCreateDto {
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class ApplicationUpdateDto {
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
}

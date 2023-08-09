import { AutoMap } from '@automapper/classes';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

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
}

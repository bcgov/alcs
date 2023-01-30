import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApplicationDocumentDto } from './application-document/application-document.dto';
import { ApplicationOwnerDto } from './application-owner/application-owner.dto';
import { ApplicationStatusDto } from './application-status/application-status.dto';

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
}

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class UpdateApplicationDto {
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
  parcelsAgricultureDescription?: string;

  @IsString()
  @IsOptional()
  parcelsAgricultureImprovementDescription?: string;

  @IsString()
  @IsOptional()
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

export class ApplicationSubmitToAlcsDto {
  @IsString()
  applicant: string;

  @IsString()
  localGovernmentUuid: string;
}

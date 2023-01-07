import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApplicationDocumentDto } from './application-document/application-document.dto';
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
  documents: ApplicationDocumentDto[];

  @AutoMap()
  status: ApplicationStatusDto;

  type: string;

  canEdit: boolean;
  canReview: boolean;
  canView: boolean;
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
}

export class ApplicationSubmitToAlcsDto {
  @IsString()
  applicant: string;

  @IsString()
  localGovernmentUuid: string;
}

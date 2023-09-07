import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { DOCUMENT_SOURCE } from '../../document/document.dto';

export class AttachExternalDocumentDto {
  @IsString()
  mimeType: string;

  @IsString()
  fileName: string;

  @IsNumber()
  fileSize: number;

  @IsString()
  fileKey: string;

  @IsString()
  source: DOCUMENT_SOURCE.APPLICANT;

  @IsString()
  @IsOptional()
  documentType?: DOCUMENT_TYPE;
}

export class PortalNotificationDocumentUpdateDto {
  @IsUUID()
  uuid: string;

  @IsString()
  @IsOptional()
  type?: DOCUMENT_TYPE | null;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  surveyPlanNumber?: string | null;

  @IsString()
  @IsOptional()
  controlNumber?: string | null;
}

import { AutoMap } from '@automapper/classes';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { DOCUMENT_TYPE } from './application-parcel-document.entity';

export class ApplicationParcelDocumentDto {
  @AutoMap()
  type: string;

  @AutoMap()
  uuid: string;

  @AutoMap()
  fileName: string;

  @AutoMap()
  fileSize: number;

  @AutoMap()
  uploadedBy?: string;

  @AutoMap()
  uploadedAt: number;

  @AutoMap()
  documentUuid: string;
}

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
  source: 'Applicant';

  @IsString()
  @IsOptional()
  documentType?: DOCUMENT_TYPE;
}

import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';
import { DOCUMENT_TYPE } from './application-document.entity';

export class ApplicationDocumentDto {
  @AutoMap()
  type: string;

  @AutoMap()
  uuid: string;

  @AutoMap()
  fileName: string;

  @AutoMap()
  mimeType: string;

  @AutoMap()
  uploadedBy: string;

  @AutoMap()
  uploadedAt: number;
}

export class AttachExternalDocumentDto {
  @IsString()
  mimeType: string;

  @IsString()
  fileName: string;

  @IsString()
  fileKey: string;

  @IsString()
  source: 'Local_Government' | 'Applicant';

  @IsString()
  documentType: DOCUMENT_TYPE;
}

import { AutoMap } from '@automapper/classes';
import { IsNumber, IsString, ValidateIf } from 'class-validator';
import { DOCUMENT_TYPE } from './application-document.entity';

export class ApplicationDocumentDto {
  @AutoMap(() => String)
  type: string | null;

  @AutoMap(() => String)
  description: string | null;

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
}

export class ApplicationDocumentUpdateDto {
  uuid: string;
  type: DOCUMENT_TYPE | null;
  description: string | null;
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
  source: 'Local_Government' | 'Applicant';

  @IsString()
  @ValidateIf((object, value) => value !== null)
  documentType: DOCUMENT_TYPE | null;
}

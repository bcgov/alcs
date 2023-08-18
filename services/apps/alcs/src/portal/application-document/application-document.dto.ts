import { IsNumber, IsOptional, IsString } from 'class-validator';
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

export class PortalApplicationDocumentUpdateDto {
  uuid: string;
  type: DOCUMENT_TYPE | null;
  description: string | null;
}

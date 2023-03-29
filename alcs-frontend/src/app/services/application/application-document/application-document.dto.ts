import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { DOCUMENT_TYPE } from './application-document.service';

export interface ApplicationDocumentTypeDto extends BaseCodeDto {
  code: DOCUMENT_TYPE;
}

export interface ApplicationDocumentDto {
  uuid: string;
  documentUuid: string;
  type?: ApplicationDocumentTypeDto;
  description?: string;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}

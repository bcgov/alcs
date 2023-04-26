import { BaseCodeDto } from '../../../shared/dto/base.dto';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM, DOCUMENT_TYPE } from './application-document.service';

export interface ApplicationDocumentTypeDto extends BaseCodeDto {
  code: DOCUMENT_TYPE;
  oatsCode: string;
}

export interface ApplicationDocumentDto {
  uuid: string;
  documentUuid: string;
  type?: ApplicationDocumentTypeDto;
  description?: string;
  visibilityFlags: string[];
  source: DOCUMENT_SOURCE;
  system: DOCUMENT_SYSTEM;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
  evidentiaryRecordSorting?: number;
}

export interface UpdateDocumentDto {
  file?: File;
  fileName: string;
  typeCode: DOCUMENT_TYPE;
  source: DOCUMENT_SOURCE;
  visibilityFlags: ('A' | 'C' | 'G' | 'P')[];
}

export interface CreateDocumentDto extends UpdateDocumentDto {
  file: File;
}

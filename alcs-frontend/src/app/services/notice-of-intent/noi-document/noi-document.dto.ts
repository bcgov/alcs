import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
  DOCUMENT_TYPE,
  DocumentTypeDto,
} from '../../../shared/document/document.dto';

export interface NoticeOfIntentDocumentDto {
  uuid: string;
  documentUuid: string;
  type?: DocumentTypeDto;
  description?: string;
  visibilityFlags: string[];
  source: DOCUMENT_SOURCE;
  system: DOCUMENT_SYSTEM;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}

export interface UpdateNoticeOfIntentDocumentDto {
  file?: File;
  parcelUuid?: string;
  ownerUuid?: string;
  fileName: string;
  typeCode: DOCUMENT_TYPE;
  source: DOCUMENT_SOURCE;
  visibilityFlags: ('A' | 'C' | 'G' | 'P')[];
}

export interface CreateNoticeOfIntentDocumentDto extends UpdateNoticeOfIntentDocumentDto {
  file: File;
}

import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM, DOCUMENT_TYPE, DocumentTypeDto } from '../../shared/document/document.dto';

export interface UpdateDocumentDto {
  file?: File;
  parcelUuid?: string;
  ownerUuid?: string;
  fileName: string;
  typeCode: DOCUMENT_TYPE;
  source: DOCUMENT_SOURCE;
  visibilityFlags?: ('A' | 'C' | 'G' | 'P')[];
}

export interface CreateDocumentDto extends UpdateDocumentDto {
  file: File;
}

export interface DocumentDto {
  uuid: string;
  documentUuid: string;
  type?: DocumentTypeDto;
  description?: string;
  visibilityFlags?: string[];
  source: DOCUMENT_SOURCE;
  system: DOCUMENT_SYSTEM;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
  evidentiaryRecordSorting?: number;
  fileSize?: number;
}

export interface SelectableParcelDto {
  uuid: string;
  pid: string;
  certificateOfTitleUuid: string;
  index: string;
}

export interface SelectableOwnerDto {
  label: string;
  uuid: string;
  corporateSummaryUuid: string;
}

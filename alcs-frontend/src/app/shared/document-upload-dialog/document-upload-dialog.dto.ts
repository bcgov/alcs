import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM, DOCUMENT_TYPE, DocumentTypeDto } from '../../shared/document/document.dto';
import { BaseCodeDto } from '../dto/base.dto';

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
  pid?: string;
  certificateOfTitleUuid?: string;
}

export interface OwnerDto {
  uuid: string;
  displayName: string;
  organizationName?: string | null;
  corporateSummaryUuid?: string;
  type: BaseCodeDto;
}

export interface SelectableOwnerDto {
  uuid: string;
  corporateSummaryUuid?: string;
  label: string;
}

export interface SubmissionOwnersDto {
  owners: OwnerDto[];
}

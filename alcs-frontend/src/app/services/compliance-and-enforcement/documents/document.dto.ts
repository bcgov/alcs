import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM, DocumentTypeDto } from '../../../shared/document/document.dto';

export interface ComplianceAndEnforcementDocumentDto {
  uuid: string;
  type: DocumentTypeDto;

  documentUuid: string;
  source: DOCUMENT_SOURCE;
  system: DOCUMENT_SYSTEM;
  fileName: string;
  mimeType: string;
  uploadedAt: number;
  fileSize?: number;
}

export interface CreateComplianceAndEnforcementDocumentDto {
  typeCode: string;

  source: DOCUMENT_SOURCE;
  fileName: string;
  file: File;
}

export interface UpdateComplianceAndEnforcementDocumentDto {
  typeCode?: string;

  source?: DOCUMENT_SOURCE;
  fileName?: string;
  file?: File;
  visibilityFlags?: ('A' | 'C' | 'G' | 'P')[];
}

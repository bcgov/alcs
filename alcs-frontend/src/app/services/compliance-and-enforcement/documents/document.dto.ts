import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM, DocumentTypeDto } from '../../../shared/document/document.dto';
import { Section } from './document.service';

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

export interface UpdateComplianceAndEnforcementDocumentDto {
  typeCode?: string;

  source?: DOCUMENT_SOURCE;
  fileName?: string;

  parcelUuid?: string;
  ownerUuid?: string;
}

export interface CreateComplianceAndEnforcementDocumentDto extends UpdateComplianceAndEnforcementDocumentDto {
  section?: Section;
  file: File;
}

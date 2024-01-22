import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../../shared/dto/document.dto';

export interface ApplicationDocumentDto {
  type: DocumentTypeDto | null;
  description?: string | null;
  uuid: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: number;
  source: DOCUMENT_SOURCE;
}

export interface ApplicationDocumentUpdateDto {
  uuid: string;
  type: DOCUMENT_TYPE | null;
  description?: string | null;
}

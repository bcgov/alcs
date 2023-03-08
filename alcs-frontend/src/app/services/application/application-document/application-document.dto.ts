import { DOCUMENT_TYPE } from './application-document.service';

export interface ApplicationDocumentDto {
  uuid: string;
  documentUuid: string;
  type: DOCUMENT_TYPE;
  fileName: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: number;
}

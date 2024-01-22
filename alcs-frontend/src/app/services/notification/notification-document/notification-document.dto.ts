import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
  DOCUMENT_TYPE,
  DocumentTypeDto,
} from '../../../shared/document/document.dto';

export interface NotificationDocumentDto {
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
  surveyPlanNumber: string | null;
  controlNumber: string | null;
}

export interface UpdateNotificationDocumentDto {
  file?: File;
  fileName: string;
  typeCode: DOCUMENT_TYPE;
  source: DOCUMENT_SOURCE;
  visibilityFlags: ('A' | 'C' | 'G' | 'P')[];
}

export interface CreateNotificationDocumentDto extends UpdateNotificationDocumentDto {
  file: File;
}

import { Observable } from 'rxjs';
import {
  CreateDocumentRequestGrpc,
  CreateDocumentResponseGrpc,
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
} from './alcs-document.message.interface';

export interface AlcsDocumentService {
  getUploadUrl(
    request: DocumentUploadRequestGrpc,
  ): Observable<DocumentUploadResponseGrpc>;
  createExternalDocument(
    request: CreateDocumentRequestGrpc,
  ): Observable<CreateDocumentResponseGrpc>;
}

export const ALCS_DOCUMENT_SERVICE_NAME = 'AlcsDocumentService';

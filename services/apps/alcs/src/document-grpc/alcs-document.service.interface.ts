import { Observable } from 'rxjs';
import {
  CreateDocumentRequestGrpc,
  CreateDocumentResponseGrpc,
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
  DocumentDeleteRequestGrpc,
  DocumentDeleteResponseGrpc,
  DocumentDownloadRequestGrpc,
  DocumentDownloadResponseGrpc,
} from './alcs-document.message.interface';

export interface AlcsDocumentService {
  getUploadUrl(
    request: DocumentUploadRequestGrpc,
  ): Observable<DocumentUploadResponseGrpc>;

  getDownloadUrl(
    request: DocumentDownloadRequestGrpc,
  ): Observable<DocumentDownloadResponseGrpc>;

  createExternalDocument(
    request: CreateDocumentRequestGrpc,
  ): Observable<CreateDocumentResponseGrpc>;

  deleteExternalDocument(
    request: DocumentDeleteRequestGrpc,
  ): Observable<DocumentDeleteResponseGrpc>;
}

export const ALCS_DOCUMENT_SERVICE_NAME = 'AlcsDocumentService';

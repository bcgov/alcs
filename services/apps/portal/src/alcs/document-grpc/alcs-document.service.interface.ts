import { Observable } from 'rxjs';
import {
  CreateDocumentRequestGrpc,
  CreateDocumentResponseGrpc,
  DocumentDeleteRequestGrpc,
  DocumentDeleteResponseGrpc,
  DocumentDownloadRequestGrpc,
  DocumentDownloadResponseGrpc,
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
} from './alcs-document.message.interface';

export interface AlcsDocumentServiceClient {
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

export const GRPC_ALCS_DOCUMENT_SERVICE_NAME = 'AlcsDocumentService';

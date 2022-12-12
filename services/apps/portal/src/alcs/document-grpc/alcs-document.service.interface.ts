import { Observable } from 'rxjs';
import {
  CreateDocumentGrpcRequest,
  CreateDocumentGrpcResponse,
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
} from './alcs-document.message.interface';

export interface AlcsDocumentServiceClient {
  getUploadUrl(
    request: DocumentUploadRequestGrpc,
  ): Observable<DocumentUploadResponseGrpc>;

  createExternalDocument(
    request: CreateDocumentGrpcRequest,
  ): Observable<CreateDocumentGrpcResponse>;
}

export const ALCS_DOCUMENT_SERVICE_NAME = 'AlcsDocumentService';

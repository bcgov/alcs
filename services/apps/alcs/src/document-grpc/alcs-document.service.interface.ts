import { Observable } from 'rxjs';
import {
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
} from './alcs-document.message.interface';

export interface AlcsDocumentService {
  getUploadUrl(
    request: DocumentUploadRequestGrpc,
  ): Observable<DocumentUploadResponseGrpc>;
}

export interface AlcsDocumentService {
  getUploadUrl(
    request: DocumentUploadRequestGrpc,
  ):
    | Promise<DocumentUploadResponseGrpc>
    | Observable<DocumentUploadResponseGrpc>
    | DocumentUploadResponseGrpc;
}

export const ALCS_DOCUMENT_SERVICE_NAME = 'AlcsDocumentService';

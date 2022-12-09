import { Observable } from 'rxjs';
import {
  ApplicationAttachDocumentGrpcRequest,
  ApplicationAttachDocumentGrpcResponse,
} from './alcs-application-document.message.interface';

export interface AlcsApplicationDocumentService {
  attachExternalDocument(
    request: ApplicationAttachDocumentGrpcRequest,
  ): Observable<ApplicationAttachDocumentGrpcResponse>;
}

export const GRPC_APPLICATION_DOCUMENT_SERVICE_NAME =
  'AlcsApplicationDocumentService';

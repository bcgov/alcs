import { Observable } from 'rxjs';
import {
  ApplicationAttachDocumentGrpcRequest,
  ApplicationAttachDocumentGrpcResponse,
} from './alcs-application.message.interface';

export interface AlcsApplicationDocumentServiceClient {
  attachExternalDocument(
    request: ApplicationAttachDocumentGrpcRequest,
  ): Observable<ApplicationAttachDocumentGrpcResponse>;
}

export const GRPC_APPLICATION_DOCUMENT_SERVICE_NAME =
  'AlcsApplicationDocumentService';

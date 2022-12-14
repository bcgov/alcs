import { Observable } from 'rxjs';
import {
  ApplicationCreateGrpcRequest,
  ApplicationGrpcResponse,
} from './alcs-application.message.interface';

export interface AlcsApplicationServiceClient {
  create(
    request: ApplicationCreateGrpcRequest,
  ): Observable<ApplicationGrpcResponse>;
}

export const GRPC_APPLICATION_SERVICE_NAME = 'AlcsApplicationService';

import { Observable } from 'rxjs';
import {
  ApplicationCreateGrpcRequest,
  ApplicationGrpcResponse,
} from './alcs-application.message.interface';

export interface AlcsApplicationService {
  create(
    request: ApplicationCreateGrpcRequest,
  ): Observable<ApplicationGrpcResponse>;
}

export const GRPC_APPLICATION_SERVICE_NAME = 'AlcsApplicationService';

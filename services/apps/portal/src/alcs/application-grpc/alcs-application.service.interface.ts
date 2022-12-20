import { Observable } from 'rxjs';
import {
  ApplicationCreateGrpcRequest,
  ApplicationFileNumberGenerateGrpcResponse,
  ApplicationGrpcResponse,
} from './alcs-application.message.interface';

export interface AlcsApplicationServiceClient {
  create(
    request: ApplicationCreateGrpcRequest,
  ): Observable<ApplicationGrpcResponse>;

  generateFileNumber(
    ApplicationFileNumberGenerateGrpcRequest,
  ): Observable<ApplicationFileNumberGenerateGrpcResponse>;
}

export const GRPC_ALCS_APPLICATION_SERVICE_NAME = 'AlcsApplicationService';

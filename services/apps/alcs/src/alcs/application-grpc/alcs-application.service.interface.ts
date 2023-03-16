import { Observable } from 'rxjs';
import {
  ApplicationCreateGrpcRequest,
  ApplicationFileNumberGenerateGrpcResponse,
  ApplicationGrpcResponse,
} from './alcs-application.message.interface';

export interface AlcsApplicationService {
  create(
    request: ApplicationCreateGrpcRequest,
  ): Observable<ApplicationGrpcResponse> | Promise<ApplicationGrpcResponse>;

  generateFileNumber(
    ApplicationFileNumberGenerateGrpcRequest,
  ):
    | Observable<ApplicationFileNumberGenerateGrpcResponse>
    | Promise<ApplicationFileNumberGenerateGrpcResponse>;
}

export const GRPC_APPLICATION_SERVICE_NAME = 'AlcsApplicationService';

import { Observable } from 'rxjs';
import { ApplicationFileNumberGenerateGrpcResponse } from './alcs-application.message.interface';

export interface AlcsApplicationService {
  generateFileNumber(
    ApplicationFileNumberGenerateGrpcRequest,
  ):
    | Observable<ApplicationFileNumberGenerateGrpcResponse>
    | Promise<ApplicationFileNumberGenerateGrpcResponse>;
}

export const GRPC_APPLICATION_SERVICE_NAME = 'AlcsApplicationService';

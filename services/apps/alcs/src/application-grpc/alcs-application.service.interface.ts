import { Observable } from 'rxjs';
import {
  ApplicationByNumberGrpc,
  ApplicationGrpc,
} from './alcs-application.message.interface';

export interface GrpcApplicationServiceClient {
  get(request: ApplicationByNumberGrpc): Observable<ApplicationGrpc>;
}

export interface GrpcApplicationServiceController {
  get(
    request: ApplicationByNumberGrpc,
  ): Promise<ApplicationGrpc> | Observable<ApplicationGrpc> | ApplicationGrpc;
}

export const GRPC_APPLICATION_SERVICE_NAME = 'GrpcApplicationService';

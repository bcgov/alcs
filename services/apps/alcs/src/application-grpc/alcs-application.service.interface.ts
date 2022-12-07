import { Observable } from 'rxjs';
import {
  ApplicationCreateGrpc,
  ApplicationGrpc,
} from './alcs-application.message.interface';

export interface AlcsApplicationServiceClient {
  create(request: ApplicationCreateGrpc): Observable<ApplicationGrpc>;
}

export const GRPC_APPLICATION_SERVICE_NAME = 'GrpcApplicationService';

import { Observable } from 'rxjs';
import {
  ApplicationCreateGrpc,
  ApplicationGrpc,
} from './alcs-application.message.interface';

export interface AlcsApplicationService {
  create(request: ApplicationCreateGrpc): Observable<ApplicationGrpc>;
}

export const GRPC_APPLICATION_SERVICE_NAME = 'AlcsApplicationService';

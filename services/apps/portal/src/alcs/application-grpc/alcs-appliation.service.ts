import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { grpcClientOptions } from '../../providers/grpc/grpc-client.options';
import {
  ApplicationCreateGrpc,
  ApplicationGrpc,
} from './alcs-application.message.interface';
import { AlcsApplicationServiceClient } from './alcs-application.service.interface';

@Injectable()
export class AlcsApplicationService
  implements OnModuleInit, AlcsApplicationServiceClient
{
  @Client(grpcClientOptions) private readonly client: ClientGrpc;
  private alcsApplicationService: AlcsApplicationServiceClient;

  onModuleInit() {
    this.alcsApplicationService =
      this.client.getService<AlcsApplicationServiceClient>(
        'AlcsApplicationService',
      );
  }

  create(request: ApplicationCreateGrpc): Observable<ApplicationGrpc> {
    return this.alcsApplicationService.create(request);
  }
}

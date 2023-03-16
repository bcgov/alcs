import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  ApplicationCreateGrpcRequest,
  ApplicationFileNumberGenerateGrpcRequest,
  ApplicationFileNumberGenerateGrpcResponse,
  ApplicationGrpcResponse,
} from './alcs-application.message.interface';

import { ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME } from '../../../../alcs/src/alcs/application-grpc/alcs-application.message.interface';
import {
  AlcsApplicationServiceClient,
  GRPC_ALCS_APPLICATION_SERVICE_NAME,
} from './alcs-application.service.interface';

@Injectable()
export class AlcsApplicationService
  implements OnModuleInit, AlcsApplicationServiceClient
{
  private alcsApplicationService: AlcsApplicationServiceClient;

  constructor(
    @Inject(ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.alcsApplicationService =
      this.client.getService<AlcsApplicationServiceClient>(
        GRPC_ALCS_APPLICATION_SERVICE_NAME,
      );
  }

  create(
    request: ApplicationCreateGrpcRequest,
  ): Observable<ApplicationGrpcResponse> {
    return this.alcsApplicationService.create(request);
  }

  generateFileNumber(): Observable<ApplicationFileNumberGenerateGrpcResponse> {
    return this.alcsApplicationService.generateFileNumber(
      {} as ApplicationFileNumberGenerateGrpcRequest,
    );
  }
}

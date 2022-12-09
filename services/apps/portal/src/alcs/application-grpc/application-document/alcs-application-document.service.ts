import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { grpcClientOptions } from '../../../providers/grpc/grpc-client.options';
import {
  ApplicationAttachDocumentGrpcRequest,
  ApplicationAttachDocumentGrpcResponse,
} from './alcs-application.message.interface';
import {
  AlcsApplicationDocumentServiceClient,
  GRPC_APPLICATION_DOCUMENT_SERVICE_NAME,
} from './alcs-application.service.interface';

@Injectable()
export class AlcsApplicationDocumentService
  implements OnModuleInit, AlcsApplicationDocumentServiceClient
{
  @Client(grpcClientOptions) private readonly client: ClientGrpc;
  private alcsApplicationDocumentService: AlcsApplicationDocumentServiceClient;

  onModuleInit() {
    this.alcsApplicationDocumentService =
      this.client.getService<AlcsApplicationDocumentServiceClient>(
        GRPC_APPLICATION_DOCUMENT_SERVICE_NAME,
      );
  }

  attachExternalDocument(
    request: ApplicationAttachDocumentGrpcRequest,
  ): Observable<ApplicationAttachDocumentGrpcResponse> {
    return this.alcsApplicationDocumentService.attachExternalDocument(request);
  }
}

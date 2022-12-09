import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { grpcClientOptions } from '../../providers/grpc/grpc-client.options';
import {
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
} from './alcs-document.message.interface';
import {
  AlcsDocumentServiceClient,
  ALCS_DOCUMENT_SERVICE_NAME,
} from './alcs-document.service.interface';

@Injectable()
export class AlcsDocumentService
  implements OnModuleInit, AlcsDocumentServiceClient
{
  @Client(grpcClientOptions) private readonly client: ClientGrpc;
  private alcsDocumentService: AlcsDocumentServiceClient;

  onModuleInit() {
    this.alcsDocumentService =
      this.client.getService<AlcsDocumentServiceClient>(
        ALCS_DOCUMENT_SERVICE_NAME,
      );
  }

  getUploadUrl(
    request: DocumentUploadRequestGrpc,
  ): Observable<DocumentUploadResponseGrpc> {
    return this.alcsDocumentService.getUploadUrl(request);
  }
}

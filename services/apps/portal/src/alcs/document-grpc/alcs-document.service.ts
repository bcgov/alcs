import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME,
  CreateDocumentRequestGrpc,
  CreateDocumentResponseGrpc,
  DocumentDeleteRequestGrpc,
  DocumentDownloadRequestGrpc,
  DocumentDownloadResponseGrpc,
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
} from './alcs-document.message.interface';
import {
  AlcsDocumentServiceClient,
  GRPC_ALCS_DOCUMENT_SERVICE_NAME,
} from './alcs-document.service.interface';

@Injectable()
export class AlcsDocumentService
  implements OnModuleInit, AlcsDocumentServiceClient
{
  private alcsDocumentService: AlcsDocumentServiceClient;

  constructor(
    @Inject(ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.alcsDocumentService =
      this.client.getService<AlcsDocumentServiceClient>(
        GRPC_ALCS_DOCUMENT_SERVICE_NAME,
      );
  }

  getUploadUrl(
    request: DocumentUploadRequestGrpc,
  ): Observable<DocumentUploadResponseGrpc> {
    return this.alcsDocumentService.getUploadUrl(request);
  }

  getDownloadUrl(
    request: DocumentDownloadRequestGrpc,
  ): Observable<DocumentDownloadResponseGrpc> {
    return this.alcsDocumentService.getDownloadUrl(request);
  }

  createExternalDocument(
    request: CreateDocumentRequestGrpc,
  ): Observable<CreateDocumentResponseGrpc> {
    return this.alcsDocumentService.createExternalDocument(request);
  }

  deleteExternalDocument(request: DocumentDeleteRequestGrpc) {
    return this.alcsDocumentService.deleteExternalDocument(request);
  }
}

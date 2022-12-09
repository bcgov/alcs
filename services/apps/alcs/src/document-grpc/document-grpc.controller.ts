import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DocumentService } from '../document/document.service';
import {
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
} from './alcs-document.message.interface';
import { ALCS_DOCUMENT_SERVICE_NAME } from './alcs-document.service.interface';

@Controller('document-grpc')
export class DocumentGrpcController {
  private logger = new Logger(DocumentGrpcController.name);

  constructor(private documentService: DocumentService) {}

  @GrpcMethod(ALCS_DOCUMENT_SERVICE_NAME, 'getUploadUrl')
  async getUploadUrl(
    data: DocumentUploadRequestGrpc,
  ): Promise<DocumentUploadResponseGrpc> {
    this.logger.debug('ALCS-> GRPC -> AlcsDocumentService -> getUploadUrl');

    return this.documentService.getUploadUrl(data.filePath);
  }
}

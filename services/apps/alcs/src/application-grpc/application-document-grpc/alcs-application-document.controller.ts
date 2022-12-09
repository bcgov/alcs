import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApplicationDocumentService } from '../../application/application-document/application-document.service';
import {
  ApplicationAttachDocumentGrpcRequest,
  ApplicationAttachDocumentGrpcResponse,
} from './alcs-application-document.message.interface';
import { GRPC_APPLICATION_DOCUMENT_SERVICE_NAME } from './alcs-application-document.service.interface';

@Controller('AlcsApplicationDocumentControllerGrpc')
export class AlcsApplicationDocumentControllerGrpc {
  constructor(private applicationService: ApplicationDocumentService) {}

  @GrpcMethod(GRPC_APPLICATION_DOCUMENT_SERVICE_NAME, 'attachExternalDocument')
  async attachExternalDocument(
    data: ApplicationAttachDocumentGrpcRequest,
  ): Promise<ApplicationAttachDocumentGrpcResponse> {
    return this.applicationService.attachExternalDocument({
      ...data,
    });
  }
}

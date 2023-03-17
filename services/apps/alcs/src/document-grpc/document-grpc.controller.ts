import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DocumentService } from '../document/document.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import {
  CreateDocumentRequestGrpc,
  CreateDocumentResponseGrpc,
  DocumentDeleteRequestGrpc,
  DocumentDeleteResponseGrpc,
  DocumentDownloadRequestGrpc,
  DocumentDownloadResponseGrpc,
  DocumentUploadRequestGrpc,
  DocumentUploadResponseGrpc,
} from './alcs-document.message.interface';
import { ALCS_DOCUMENT_SERVICE_NAME } from './alcs-document.service.interface';

@Controller('document-grpc')
export class DocumentGrpcController {
  private logger = new Logger(DocumentGrpcController.name);

  constructor(
    private documentService: DocumentService,
    private userService: UserService,
  ) {}

  private async getUploadedBy(uploadedByUuid?: string | null) {
    let user: User | null = null;

    if (uploadedByUuid) {
      user = await this.userService.getByUuid(uploadedByUuid);

      if (!user) {
        throw new BadRequestException(
          `User not found with uuid ${uploadedByUuid}`,
        );
      }
    }

    return user;
  }

  @GrpcMethod(ALCS_DOCUMENT_SERVICE_NAME, 'getUploadUrl')
  async getUploadUrl(
    data: DocumentUploadRequestGrpc,
  ): Promise<DocumentUploadResponseGrpc> {
    this.logger.debug('ALCS-> GRPC -> AlcsDocumentService -> getUploadUrl');

    return this.documentService.getUploadUrl(data.filePath);
  }

  @GrpcMethod(ALCS_DOCUMENT_SERVICE_NAME, 'getDownloadUrl')
  async getDownloadUrl(
    data: DocumentDownloadRequestGrpc,
  ): Promise<DocumentDownloadResponseGrpc> {
    this.logger.debug('ALCS-> GRPC -> AlcsDocumentService -> getDownloadUrl');
    const document = await this.documentService.getDocument(data.uuid);
    const downloadUrl = await this.documentService.getDownloadUrl(
      document,
      true,
    );
    return {
      url: downloadUrl,
    };
  }

  // @GrpcMethod(ALCS_DOCUMENT_SERVICE_NAME, 'createExternalDocument')
  // async attachExternalDocument(
  //   data: CreateDocumentRequestGrpc,
  // ): Promise<CreateDocumentResponseGrpc> {
  //   this.logger.debug(
  //     'ALCS-> GRPC -> AlcsDocumentService -> createExternalDocument',
  //   );
  //
  //   const uploadedBy = await this.getUploadedBy(data.uploadedByUuid);
  //
  //   const document = await this.documentService.createDocumentRecord({
  //     ...data,
  //     uploadedBy: uploadedBy,
  //   });
  //
  //   return { alcsDocumentUuid: document.uuid };
  // }

  @GrpcMethod(ALCS_DOCUMENT_SERVICE_NAME, 'deleteExternalDocument')
  async deleteExternalDocument(
    data: DocumentDeleteRequestGrpc,
  ): Promise<DocumentDeleteResponseGrpc> {
    this.logger.debug(
      'ALCS-> GRPC -> AlcsDocumentService -> deleteExternalDocument',
    );
    const document = await this.documentService.getDocument(data.uuid);

    await this.documentService.softRemove(document);
    return {
      uuid: document.uuid,
    };
  }
}

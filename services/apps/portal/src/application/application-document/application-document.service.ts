import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Any, Repository } from 'typeorm';
import { Document } from '../../document/document.entity';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { ApplicationService } from '../application.service';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from './application-document.entity';

@Injectable()
export class ApplicationDocumentService {
  constructor(
    private documentService: DocumentService,
    private applicationService: ApplicationService,
    @InjectRepository(ApplicationDocument)
    private applicationDocumentRepository: Repository<ApplicationDocument>,
  ) {}

  async get(uuid: string) {
    const applicationDocument =
      await this.applicationDocumentRepository.findOne({
        where: {
          uuid: uuid,
        },
        relations: {
          document: true,
        },
      });
    if (!applicationDocument) {
      throw new NotFoundException(`Failed to find document ${uuid}`);
    }
    return applicationDocument;
  }

  async delete(applicationDocument: ApplicationDocument) {
    if (!applicationDocument.document) {
      throw new BaseServiceException(
        'Failed to delete ApplicationDocument, passed ApplicationDocument without Document',
      );
    }

    return this.documentService.delete(applicationDocument.document);
  }

  async list(fileNumber: string, documentType: DOCUMENT_TYPE) {
    return this.applicationDocumentRepository.find({
      where: {
        type: documentType,
        application: {
          fileNumber,
        },
      },
      relations: {
        document: true,
      },
    });
  }

  async listAll(fileNumbers: string[], documentType: DOCUMENT_TYPE) {
    return this.applicationDocumentRepository.find({
      where: {
        type: documentType,
        application: {
          fileNumber: Any(fileNumbers),
        },
      },
    });
  }

  getInlineUrl(applicationDocument: ApplicationDocument) {
    return firstValueFrom(
      this.documentService.getDownloadUrl(
        applicationDocument.document.alcsDocumentUuid,
      ),
    );
  }

  async createRecord(
    fileName: string,
    fileSize: number,
    fileNumber: string,
    alcsDocumentUuid: string,
    documentType: DOCUMENT_TYPE,
    user: User,
  ) {
    const application = await this.applicationService.getOrFail(fileNumber);

    const document = new Document({
      fileName,
      fileSize,
      alcsDocumentUuid,
      uploadedBy: user,
    });

    return this.applicationDocumentRepository.save(
      new ApplicationDocument({
        document,
        type: documentType,
        application,
      }),
    );
  }
}

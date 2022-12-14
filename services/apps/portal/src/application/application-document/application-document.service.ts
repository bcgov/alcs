import { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { DocumentService } from '../../alcs/document/document.service';
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

  async attachDocument(
    fileNumber: string,
    file: MultipartFile,
    user: User,
    documentType: DOCUMENT_TYPE,
  ) {
    const application = await this.applicationService.getOrFail(fileNumber);
    const documentUuid = await this.documentService.create(
      `application/${fileNumber}`,
      file,
      user,
    );
    const appDocument = new ApplicationDocument({
      type: documentType,
      application,
      alcsDocumentUuid: documentUuid,
      uploadedBy: user,
    });

    return this.applicationDocumentRepository.save(appDocument);
  }

  async get(uuid: string) {
    const document = await this.applicationDocumentRepository.findOne({
      where: {
        uuid: uuid,
      },
    });
    if (!document) {
      throw new NotFoundException(`Failed to find document ${uuid}`);
    }
    return document;
  }

  async delete(document: ApplicationDocument) {
    await this.applicationDocumentRepository.delete(document.uuid);
    await this.documentService.delete(document.alcsDocumentUuid);
    return document;
  }

  async list(fileNumber: string, documentType: DOCUMENT_TYPE) {
    return this.applicationDocumentRepository.find({
      where: {
        type: documentType,
        application: {
          fileNumber,
        },
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

  async getInlineUrl(document: ApplicationDocument) {
    return this.documentService.getDownloadUrl(document.alcsDocumentUuid, true);
  }

  async getDownloadUrl(document: ApplicationDocument) {
    return this.documentService.getDownloadUrl(document.alcsDocumentUuid);
  }

  async createRecord(
    fileNumber: string,
    alcsDocumentUuid: string,
    documentType: DOCUMENT_TYPE,
    user: User,
  ) {
    const application = await this.applicationService.getOrFail(fileNumber);

    return this.applicationDocumentRepository.save(
      new ApplicationDocument({
        type: documentType,
        application,
        alcsDocumentUuid: alcsDocumentUuid,
        uploadedBy: user,
      }),
    );
  }
}

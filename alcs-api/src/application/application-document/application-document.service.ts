import { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, FindOptionsRelations, Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { ApplicationService } from '../application.service';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from './application-document.entity';

@Injectable()
export class ApplicationDocumentService {
  private DEFAULT_RELATIONS: FindOptionsRelations<ApplicationDocument> = {
    document: true,
  };

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
    const application = await this.applicationService.get(fileNumber);
    if (!application) {
      throw new ServiceNotFoundException(`File Number not Found ${fileNumber}`);
    }

    const document = await this.documentService.create(
      `application/${fileNumber}`,
      file,
      user,
    );
    const appDocument = new ApplicationDocument({
      type: documentType,
      application,
      document,
    });

    return this.applicationDocumentRepository.save(appDocument);
  }

  async get(uuid: string) {
    const document = await this.applicationDocumentRepository.findOne({
      where: {
        uuid: uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
    if (!document) {
      throw new NotFoundException(`Failed to find document ${uuid}`);
    }
    return document;
  }

  async delete(document: ApplicationDocument) {
    await this.applicationDocumentRepository.delete(document.uuid);
    await this.documentService.softRemove(document.document);
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
      relations: this.DEFAULT_RELATIONS,
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
      order: {
        document: {
          fileName: 'ASC',
        },
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getInlineUrl(document: ApplicationDocument) {
    return this.documentService.getDownloadUrl(document.document, true);
  }

  async getDownloadUrl(document: ApplicationDocument) {
    return this.documentService.getDownloadUrl(document.document);
  }
}

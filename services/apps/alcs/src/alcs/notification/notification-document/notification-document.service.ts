import { MultipartFile } from '@fastify/multipart';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayOverlap,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import {
  DOCUMENT_TYPE,
  DocumentCode,
} from '../../../document/document-code.entity';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { DocumentService } from '../../../document/document.service';
import { PortalNotificationDocumentUpdateDto } from '../../../portal/notification-document/notification-document.dto';
import { User } from '../../../user/user.entity';
import { NotificationService } from '../notification.service';
import {
  NotificationDocument,
  VISIBILITY_FLAG,
} from './notification-document.entity';

@Injectable()
export class NotificationDocumentService {
  private DEFAULT_RELATIONS: FindOptionsRelations<NotificationDocument> = {
    document: true,
    type: true,
  };

  constructor(
    private documentService: DocumentService,
    private notificationService: NotificationService,
    @InjectRepository(NotificationDocument)
    private notificationDocumentRepository: Repository<NotificationDocument>,
    @InjectRepository(DocumentCode)
    private documentCodeRepository: Repository<DocumentCode>,
  ) {}

  async attachDocument({
    fileNumber,
    fileName,
    file,
    documentType,
    user,
    system,
    source = DOCUMENT_SOURCE.ALC,
    visibilityFlags,
  }: {
    fileNumber: string;
    fileName: string;
    file: MultipartFile;
    user: User;
    documentType: DOCUMENT_TYPE;
    source?: DOCUMENT_SOURCE;
    system: DOCUMENT_SYSTEM;
    visibilityFlags: VISIBILITY_FLAG[];
  }) {
    const notification = await this.notificationService.getByFileNumber(
      fileNumber,
    );
    const document = await this.documentService.create(
      `notification/${fileNumber}`,
      fileName,
      file,
      user,
      source,
      system,
    );
    const appDocument = new NotificationDocument({
      typeCode: documentType,
      notification,
      document,
      visibilityFlags,
    });

    return this.notificationDocumentRepository.save(appDocument);
  }

  async get(uuid: string) {
    const document = await this.notificationDocumentRepository.findOne({
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

  async delete(document: NotificationDocument) {
    await this.notificationDocumentRepository.remove(document);
    await this.documentService.softRemove(document.document);
    return document;
  }

  async list(fileNumber: string, visibilityFlags?: VISIBILITY_FLAG[]) {
    const where: FindOptionsWhere<NotificationDocument> = {
      notification: {
        fileNumber,
      },
    };
    if (visibilityFlags) {
      where.visibilityFlags = ArrayOverlap(visibilityFlags);
    }
    return this.notificationDocumentRepository.find({
      where,
      order: {
        document: {
          uploadedAt: 'DESC',
        },
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getInlineUrl(document: NotificationDocument) {
    return this.documentService.getDownloadUrl(document.document, true);
  }

  async getDownloadUrl(document: NotificationDocument) {
    return this.documentService.getDownloadUrl(document.document);
  }

  async attachExternalDocument(
    fileNumber: string,
    data: {
      type?: DOCUMENT_TYPE;
      documentUuid: string;
      description?: string;
    },
    visibilityFlags: VISIBILITY_FLAG[],
  ) {
    const notificationUuid = await this.notificationService.getUuid(fileNumber);
    const document = new NotificationDocument({
      notificationUuid,
      typeCode: data.type,
      documentUuid: data.documentUuid,
      description: data.description,
      visibilityFlags,
    });

    const savedDocument = await this.notificationDocumentRepository.save(
      document,
    );
    return this.get(savedDocument.uuid);
  }

  async updateDescriptionAndType(
    updates: PortalNotificationDocumentUpdateDto[],
    notificationUuid: string,
  ) {
    const results: NotificationDocument[] = [];
    for (const update of updates) {
      const file = await this.notificationDocumentRepository.findOne({
        where: {
          uuid: update.uuid,
          notificationUuid,
        },
        relations: {
          document: true,
        },
      });
      if (!file) {
        throw new BadRequestException(
          'Failed to find file linked to provided notification',
        );
      }

      file.typeCode = update.type;
      file.description = update.description;
      file.controlNumber = update.controlNumber;
      file.surveyPlanNumber = update.surveyPlanNumber;
      const updatedFile = await this.notificationDocumentRepository.save(file);
      results.push(updatedFile);
    }
    return results;
  }

  async deleteByType(documentType: DOCUMENT_TYPE, notificationUuid: string) {
    const documents = await this.notificationDocumentRepository.find({
      where: {
        notificationUuid,
        typeCode: documentType,
      },
      relations: {
        document: true,
      },
    });
    for (const document of documents) {
      await this.documentService.softRemove(document.document);
      await this.notificationDocumentRepository.remove(document);
    }

    return;
  }

  async getApplicantDocuments(fileNumber: string) {
    const documents = await this.list(fileNumber);
    return documents.filter(
      (doc) => doc.document.source === DOCUMENT_SOURCE.APPLICANT,
    );
  }

  async fetchTypes() {
    return await this.documentCodeRepository.find();
  }

  async update({
    uuid,
    documentType,
    file,
    fileName,
    source,
    visibilityFlags,
    user,
  }: {
    uuid: string;
    file?: any;
    fileName: string;
    documentType: DOCUMENT_TYPE;
    visibilityFlags: VISIBILITY_FLAG[];
    source: DOCUMENT_SOURCE;
    user: User;
  }) {
    const notificationDocument = await this.get(uuid);

    if (file) {
      const fileNumber = await this.notificationService.getFileNumber(
        notificationDocument.notificationUuid,
      );
      await this.documentService.softRemove(notificationDocument.document);
      notificationDocument.document = await this.documentService.create(
        `notification/${fileNumber}`,
        fileName,
        file,
        user,
        source,
        notificationDocument.document.system as DOCUMENT_SYSTEM,
      );
    } else {
      await this.documentService.update(notificationDocument.document, {
        fileName,
        source,
      });
    }
    notificationDocument.type = undefined;
    notificationDocument.typeCode = documentType;
    notificationDocument.visibilityFlags = visibilityFlags;
    return await this.notificationDocumentRepository.save(notificationDocument);
  }
}

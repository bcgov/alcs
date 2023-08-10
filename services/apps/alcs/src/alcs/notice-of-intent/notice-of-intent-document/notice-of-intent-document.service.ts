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
import { PortalNoticeOfIntentDocumentUpdateDto } from '../../../portal/notice-of-intent-document/notice-of-intent-document.dto';
import { User } from '../../../user/user.entity';
import { NoticeOfIntentService } from '../notice-of-intent.service';
import {
  NoticeOfIntentDocument,
  VISIBILITY_FLAG,
} from './notice-of-intent-document.entity';

@Injectable()
export class NoticeOfIntentDocumentService {
  private DEFAULT_RELATIONS: FindOptionsRelations<NoticeOfIntentDocument> = {
    document: true,
    type: true,
  };

  constructor(
    private documentService: DocumentService,
    private noticeOfIntentService: NoticeOfIntentService,
    @InjectRepository(NoticeOfIntentDocument)
    private noticeOfIntentDocumentRepository: Repository<NoticeOfIntentDocument>,
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
    const noticeOfIntent = await this.noticeOfIntentService.getByFileNumber(
      fileNumber,
    );
    const document = await this.documentService.create(
      `noticeOfIntent/${fileNumber}`,
      fileName,
      file,
      user,
      source,
      system,
    );
    const appDocument = new NoticeOfIntentDocument({
      typeCode: documentType,
      noticeOfIntent,
      document,
      visibilityFlags,
    });

    return this.noticeOfIntentDocumentRepository.save(appDocument);
  }

  async attachDocumentAsBuffer({
    fileNumber,
    fileName,
    file,
    mimeType,
    fileSize,
    documentType,
    user,
    system,
    source = DOCUMENT_SOURCE.ALC,
    visibilityFlags,
  }: {
    fileNumber: string;
    fileName: string;
    file: Buffer;
    mimeType: string;
    fileSize: number;
    user: User;
    documentType: DOCUMENT_TYPE;
    source?: DOCUMENT_SOURCE;
    system: DOCUMENT_SYSTEM;
    visibilityFlags: VISIBILITY_FLAG[];
  }) {
    const noticeOfIntent = await this.noticeOfIntentService.getByFileNumber(
      fileNumber,
    );
    const document = await this.documentService.createFromBuffer(
      `noticeOfIntent/${fileNumber}`,
      fileName,
      file,
      mimeType,
      fileSize,
      user,
      source,
      system,
    );
    const appDocument = new NoticeOfIntentDocument({
      typeCode: documentType,
      noticeOfIntent,
      document,
      visibilityFlags,
    });

    return this.noticeOfIntentDocumentRepository.save(appDocument);
  }

  async get(uuid: string) {
    const document = await this.noticeOfIntentDocumentRepository.findOne({
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

  async delete(document: NoticeOfIntentDocument) {
    await this.noticeOfIntentDocumentRepository.remove(document);
    await this.documentService.softRemove(document.document);
    return document;
  }

  async list(fileNumber: string, visibilityFlags?: VISIBILITY_FLAG[]) {
    const where: FindOptionsWhere<NoticeOfIntentDocument> = {
      noticeOfIntent: {
        fileNumber,
      },
    };
    if (visibilityFlags) {
      where.visibilityFlags = ArrayOverlap(visibilityFlags);
    }
    return this.noticeOfIntentDocumentRepository.find({
      where,
      order: {
        document: {
          uploadedAt: 'DESC',
        },
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getInlineUrl(document: NoticeOfIntentDocument) {
    return this.documentService.getDownloadUrl(document.document, true);
  }

  async getDownloadUrl(document: NoticeOfIntentDocument) {
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
    const noticeOfIntentUuid = await this.noticeOfIntentService.getUuid(
      fileNumber,
    );
    const document = new NoticeOfIntentDocument({
      noticeOfIntentUuid,
      typeCode: data.type,
      documentUuid: data.documentUuid,
      description: data.description,
      visibilityFlags,
    });

    const savedDocument = await this.noticeOfIntentDocumentRepository.save(
      document,
    );
    return this.get(savedDocument.uuid);
  }
  async updateDescriptionAndType(
    updates: PortalNoticeOfIntentDocumentUpdateDto[],
    noticeOfIntentUuid: string,
  ) {
    const results: NoticeOfIntentDocument[] = [];
    for (const update of updates) {
      const file = await this.noticeOfIntentDocumentRepository.findOne({
        where: {
          uuid: update.uuid,
          noticeOfIntentUuid,
        },
        relations: {
          document: true,
        },
      });
      if (!file) {
        throw new BadRequestException(
          'Failed to find file linked to provided noticeOfIntent',
        );
      }

      file.typeCode = update.type;
      file.description = update.description;
      const updatedFile = await this.noticeOfIntentDocumentRepository.save(
        file,
      );
      results.push(updatedFile);
    }
    return results;
  }

  async deleteByType(documentType: DOCUMENT_TYPE, noticeOfIntentUuid: string) {
    const documents = await this.noticeOfIntentDocumentRepository.find({
      where: {
        noticeOfIntentUuid,
        typeCode: documentType,
      },
      relations: {
        document: true,
      },
    });
    for (const document of documents) {
      await this.documentService.softRemove(document.document);
      await this.noticeOfIntentDocumentRepository.remove(document);
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
    const appDocument = await this.get(uuid);

    if (file) {
      const fileNumber = await this.noticeOfIntentService.getFileNumber(
        appDocument.noticeOfIntentUuid,
      );
      await this.documentService.softRemove(appDocument.document);
      appDocument.document = await this.documentService.create(
        `noticeOfIntent/${fileNumber}`,
        fileName,
        file,
        user,
        source,
        appDocument.document.system as DOCUMENT_SYSTEM,
      );
    } else {
      await this.documentService.update(appDocument.document, {
        fileName,
        source,
      });
    }
    appDocument.type = undefined;
    appDocument.typeCode = documentType;
    appDocument.visibilityFlags = visibilityFlags;
    return await this.noticeOfIntentDocumentRepository.save(appDocument);
  }
}

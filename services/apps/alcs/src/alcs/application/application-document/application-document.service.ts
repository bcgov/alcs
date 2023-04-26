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
  In,
  Repository,
} from 'typeorm';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { DocumentService } from '../../../document/document.service';
import { PortalApplicationDocumentUpdateDto } from '../../../portal/application-document/application-document.dto';
import { User } from '../../../user/user.entity';
import { ApplicationService } from '../application.service';
import {
  ApplicationDocumentCode,
  DOCUMENT_TYPE,
} from './application-document-code.entity';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from './application-document.entity';

@Injectable()
export class ApplicationDocumentService {
  private DEFAULT_RELATIONS: FindOptionsRelations<ApplicationDocument> = {
    document: true,
    type: true,
  };

  constructor(
    private documentService: DocumentService,
    private applicationService: ApplicationService,
    @InjectRepository(ApplicationDocument)
    private applicationDocumentRepository: Repository<ApplicationDocument>,
    @InjectRepository(ApplicationDocumentCode)
    private applicationDocumentCodeRepository: Repository<ApplicationDocumentCode>,
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
    const application = await this.applicationService.getOrFail(fileNumber);
    const document = await this.documentService.create(
      `application/${fileNumber}`,
      fileName,
      file,
      user,
      source,
      system,
    );
    const appDocument = new ApplicationDocument({
      typeCode: documentType,
      application,
      document,
      visibilityFlags,
    });

    return this.applicationDocumentRepository.save(appDocument);
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
    const application = await this.applicationService.getOrFail(fileNumber);
    const document = await this.documentService.createFromBuffer(
      `application/${fileNumber}`,
      fileName,
      file,
      mimeType,
      fileSize,
      user,
      source,
      system,
    );
    const appDocument = new ApplicationDocument({
      typeCode: documentType,
      application,
      document,
      visibilityFlags,
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
    await this.applicationDocumentRepository.remove(document);
    await this.documentService.softRemove(document.document);
    return document;
  }

  async list(fileNumber: string, visibilityFlags?: VISIBILITY_FLAG[]) {
    const where: FindOptionsWhere<ApplicationDocument> = {
      application: {
        fileNumber,
      },
    };
    if (visibilityFlags) {
      where.visibilityFlags = ArrayOverlap(visibilityFlags);
    }
    return this.applicationDocumentRepository.find({
      where,
      order: {
        document: {
          uploadedAt: 'DESC',
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

  async attachExternalDocument(
    fileNumber: string,
    data: {
      type?: DOCUMENT_TYPE;
      documentUuid: string;
      description?: string;
    },
    visibilityFlags: VISIBILITY_FLAG[],
  ) {
    const applicationUuid = await this.applicationService.getUuid(fileNumber);
    const document = new ApplicationDocument({
      applicationUuid,
      typeCode: data.type,
      documentUuid: data.documentUuid,
      description: data.description,
      visibilityFlags,
    });

    const savedDocument = await this.applicationDocumentRepository.save(
      document,
    );
    return this.get(savedDocument.uuid);
  }

  async updateDescriptionAndType(
    updates: PortalApplicationDocumentUpdateDto[],
    applicationUuid: string,
  ) {
    const results: ApplicationDocument[] = [];
    for (const update of updates) {
      const file = await this.applicationDocumentRepository.findOne({
        where: {
          uuid: update.uuid,
          applicationUuid,
        },
        relations: {
          document: true,
        },
      });
      if (!file) {
        throw new BadRequestException(
          'Failed to find file linked to provided application',
        );
      }

      file.typeCode = update.type;
      file.description = update.description;
      const updatedFile = await this.applicationDocumentRepository.save(file);
      results.push(updatedFile);
    }
    return results;
  }

  async deleteByType(documentType: DOCUMENT_TYPE, applicationUuid: string) {
    const documents = await this.applicationDocumentRepository.find({
      where: {
        applicationUuid,
        typeCode: documentType,
      },
      relations: {
        document: true,
      },
    });
    for (const document of documents) {
      await this.documentService.softRemove(document.document);
      await this.applicationDocumentRepository.remove(document);
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
    return await this.applicationDocumentCodeRepository.find();
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
      const fileNumber = await this.applicationService.getFileNumber(
        appDocument.applicationUuid,
      );
      await this.documentService.softRemove(appDocument.document);
      appDocument.document = await this.documentService.create(
        `application/${fileNumber}`,
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
    await this.applicationDocumentRepository.save(appDocument);
  }

  async setSorting(data: { uuid: string; order: number }[]) {
    const uuids = data.map((data) => data.uuid);
    const documents = await this.applicationDocumentRepository.find({
      where: {
        uuid: In(uuids),
      },
    });

    for (const document of data) {
      const existingDocument = documents.find(
        (doc) => doc.uuid === document.uuid,
      );
      if (existingDocument) {
        existingDocument.evidentiaryRecordSorting = document.order;
      }
    }

    await this.applicationDocumentRepository.save(documents);
  }
}

import { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import {
  DOCUMENT_TYPE,
  DocumentCode,
} from '../../../document/document-code.entity';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { DocumentService } from '../../../document/document.service';
import { User } from '../../../user/user.entity';
import { InquiryService } from '../inquiry.service';
import { InquiryDocument } from './inquiry-document.entity';

@Injectable()
export class InquiryDocumentService {
  private DEFAULT_RELATIONS: FindOptionsRelations<InquiryDocument> = {
    document: true,
    type: true,
  };

  constructor(
    private documentService: DocumentService,
    private inquiryService: InquiryService,
    @InjectRepository(InquiryDocument)
    private inquiryDocumentRepository: Repository<InquiryDocument>,
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
  }: {
    fileNumber: string;
    fileName: string;
    file: MultipartFile;
    user: User;
    documentType: DOCUMENT_TYPE;
    source?: DOCUMENT_SOURCE;
    system: DOCUMENT_SYSTEM;
  }) {
    const inquiry = await this.inquiryService.getByFileNumber(fileNumber);
    const document = await this.documentService.create(
      `inquiry/${fileNumber}`,
      fileName,
      file,
      user,
      source,
      system,
    );
    const incDocument = new InquiryDocument({
      typeCode: documentType,
      inquiry,
      document,
    });

    return this.inquiryDocumentRepository.save(incDocument);
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
  }) {
    const inquiry = await this.inquiryService.getByFileNumber(fileNumber);
    const document = await this.documentService.createFromBuffer(
      `inquiry/${fileNumber}`,
      fileName,
      file,
      mimeType,
      fileSize,
      user,
      source,
      system,
    );
    const appDocument = new InquiryDocument({
      typeCode: documentType,
      inquiry,
      document,
    });

    return await this.inquiryDocumentRepository.save(appDocument);
  }

  async get(uuid: string) {
    const document = await this.inquiryDocumentRepository.findOne({
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

  async delete(document: InquiryDocument) {
    await this.inquiryDocumentRepository.remove(document);
    await this.documentService.softRemove(document.document);
    return document;
  }

  async list(fileNumber: string) {
    const where: FindOptionsWhere<InquiryDocument> = {
      inquiry: {
        fileNumber,
      },
    };
    return this.inquiryDocumentRepository.find({
      where,
      order: {
        document: {
          uploadedAt: 'DESC',
        },
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getInlineUrl(document: InquiryDocument) {
    return this.documentService.getDownloadUrl(document.document, true);
  }

  async getDownloadUrl(document: InquiryDocument) {
    return this.documentService.getDownloadUrl(document.document);
  }

  async attachExternalDocument(
    fileNumber: string,
    data: {
      type?: DOCUMENT_TYPE;
      documentUuid: string;
    },
  ) {
    const inquiryUuid = await this.inquiryService.getUuid(fileNumber);
    const document = new InquiryDocument({
      inquiryUuid,
      typeCode: data.type,
      documentUuid: data.documentUuid,
    });

    const savedDocument = await this.inquiryDocumentRepository.save(document);
    return this.get(savedDocument.uuid);
  }

  async deleteByType(documentType: DOCUMENT_TYPE, inquiryUuid: string) {
    const documents = await this.inquiryDocumentRepository.find({
      where: {
        inquiryUuid,
        typeCode: documentType,
      },
      relations: {
        document: true,
      },
    });
    for (const document of documents) {
      await this.documentService.softRemove(document.document);
      await this.inquiryDocumentRepository.remove(document);
    }

    return;
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
    user,
  }: {
    uuid: string;
    file?: any;
    fileName: string;
    documentType: DOCUMENT_TYPE;
    source: DOCUMENT_SOURCE;
    user: User;
  }) {
    const inquiryDocument = await this.get(uuid);

    if (file) {
      const fileNumber = await this.inquiryService.getFileNumber(
        inquiryDocument.inquiryUuid,
      );
      await this.documentService.softRemove(inquiryDocument.document);
      inquiryDocument.document = await this.documentService.create(
        `inquiry/${fileNumber}`,
        fileName,
        file,
        user,
        source,
        inquiryDocument.document.system as DOCUMENT_SYSTEM,
      );
    } else {
      await this.documentService.update(inquiryDocument.document, {
        fileName,
        source,
      });
    }
    inquiryDocument.type = undefined;
    inquiryDocument.typeCode = documentType;
    return await this.inquiryDocumentRepository.save(inquiryDocument);
  }
}

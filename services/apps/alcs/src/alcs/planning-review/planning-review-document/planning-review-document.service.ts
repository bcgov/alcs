import { MultipartFile } from '@fastify/multipart';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayOverlap,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
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
import { User } from '../../../user/user.entity';
import { PlanningReviewService } from '../planning-review.service';
import {
  PlanningReviewDocument,
  PR_VISIBILITY_FLAG,
} from './planning-review-document.entity';

@Injectable()
export class PlanningReviewDocumentService {
  private DEFAULT_RELATIONS: FindOptionsRelations<PlanningReviewDocument> = {
    document: true,
    type: true,
  };

  constructor(
    private documentService: DocumentService,
    private planningReviewService: PlanningReviewService,
    @InjectRepository(PlanningReviewDocument)
    private planningReviewDocumentRepo: Repository<PlanningReviewDocument>,
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
    visibilityFlags = [],
  }: {
    fileNumber: string;
    fileName: string;
    file: MultipartFile;
    user: User;
    documentType: DOCUMENT_TYPE;
    source?: DOCUMENT_SOURCE;
    system: DOCUMENT_SYSTEM;
    visibilityFlags: PR_VISIBILITY_FLAG[];
  }) {
    const planningReview =
      await this.planningReviewService.getDetailedReview(fileNumber);
    const document = await this.documentService.create(
      `planning-review/${fileNumber}`,
      fileName,
      file,
      user,
      source,
      system,
    );
    const appDocument = new PlanningReviewDocument({
      typeCode: documentType,
      planningReview,
      document,
      visibilityFlags,
    });

    return this.planningReviewDocumentRepo.save(appDocument);
  }

  async get(uuid: string) {
    const document = await this.planningReviewDocumentRepo.findOne({
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

  async delete(document: PlanningReviewDocument) {
    await this.planningReviewDocumentRepo.remove(document);
    await this.documentService.softRemove(document.document);
    return document;
  }

  async list(fileNumber: string, visibilityFlags?: PR_VISIBILITY_FLAG[]) {
    const where: FindOptionsWhere<PlanningReviewDocument> = {
      planningReview: {
        fileNumber,
      },
    };
    if (visibilityFlags) {
      where.visibilityFlags = ArrayOverlap(visibilityFlags);
    }
    return this.planningReviewDocumentRepo.find({
      where,
      order: {
        document: {
          uploadedAt: 'DESC',
        },
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getInlineUrl(document: PlanningReviewDocument) {
    return this.documentService.getDownloadUrl(document.document, true);
  }

  async getDownloadUrl(document: PlanningReviewDocument) {
    return this.documentService.getDownloadUrl(document.document);
  }

  async attachExternalDocument(
    fileNumber: string,
    data: {
      type?: DOCUMENT_TYPE;
      documentUuid: string;
      description?: string;
    },
    visibilityFlags: PR_VISIBILITY_FLAG[],
  ) {
    const planningReview =
      await this.planningReviewService.getDetailedReview(fileNumber);
    const document = new PlanningReviewDocument({
      planningReview,
      typeCode: data.type,
      documentUuid: data.documentUuid,
      description: data.description,
      visibilityFlags,
    });

    const savedDocument = await this.planningReviewDocumentRepo.save(document);
    return this.get(savedDocument.uuid);
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
    visibilityFlags: PR_VISIBILITY_FLAG[];
    source: DOCUMENT_SOURCE;
    user: User;
  }) {
    const appDocument = await this.get(uuid);

    if (file) {
      const fileNumber = await this.planningReviewService.getFileNumber(
        appDocument.planningReviewUuid,
      );
      await this.documentService.softRemove(appDocument.document);
      appDocument.document = await this.documentService.create(
        `planning-review/${fileNumber}`,
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
    return await this.planningReviewDocumentRepo.save(appDocument);
  }

  async setSorting(data: { uuid: string; order: number }[]) {
    const uuids = data.map((data) => data.uuid);
    const documents = await this.planningReviewDocumentRepo.find({
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

    await this.planningReviewDocumentRepo.save(documents);
  }
}

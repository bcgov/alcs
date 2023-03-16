import { BaseServiceException } from '@app/common/exceptions/base.exception';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { ApplicationDocumentUpdateDto } from '../../../alcs/application/application-document/application-document.dto';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from '../../../alcs/application/application-document/application-document.entity';
import { DocumentService } from '../../../document/document.service';
import { ApplicationProposalService } from '../application-proposal.service';

@Injectable()
export class ApplicationDocumentService {
  constructor(
    private documentService: DocumentService,
    private applicationService: ApplicationProposalService,
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

    return this.documentService.softRemove(applicationDocument.document);
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
    return this.documentService.getDownloadUrl(applicationDocument.document);
  }

  async update(
    updates: ApplicationDocumentUpdateDto[],
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

      file.type = update.type;
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
        type: documentType,
      },
      relations: {
        document: true,
      },
    });
    for (const document of documents) {
      await this.documentService.softRemove(document.document);
    }

    return;
  }
}

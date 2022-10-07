import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationDecisionOutcomeType } from './application-decision-outcome.entity';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecision } from './application-decision.entity';
import { DecisionDocument } from './decision-document.entity';

@Injectable()
export class ApplicationDecisionService {
  constructor(
    @InjectRepository(ApplicationDecision)
    private appDecisionRepository: Repository<ApplicationDecision>,
    @InjectRepository(DecisionDocument)
    private decisionDocumentRepository: Repository<DecisionDocument>,
    @InjectRepository(ApplicationDecisionOutcomeType)
    private decisionOutcomeRepository: Repository<ApplicationDecisionOutcomeType>,
    private applicationService: ApplicationService,
    private documentService: DocumentService,
  ) {}

  async getByAppFileNumber(number: string) {
    const application = await this.applicationService.get(number);

    if (!application) {
      throw new ServiceNotFoundException(
        `Application with provided number not found ${number}`,
      );
    }

    const records = await this.appDecisionRepository.find({
      where: { applicationUuid: application.uuid },
      order: {
        date: 'DESC',
        documents: {
          document: {
            uploadedAt: 'DESC',
          },
        },
      },
      relations: {
        outcome: true,
        documents: {
          document: {
            uploadedBy: true,
          },
        },
      },
    });

    //Filter out documents where the document was deleted
    return records.map((record) => {
      record.documents = record.documents.filter(
        (document) => !!document.document,
      );
      return record;
    });
  }

  get(uuid) {
    return this.appDecisionRepository.findOne({
      where: { uuid },
      relations: {
        outcome: true,
        documents: {
          document: true,
        },
      },
    });
  }

  async update(uuid: string, updateData: UpdateApplicationDecisionDto) {
    const existingDecision = await this.appDecisionRepository.findOne({
      where: {
        uuid,
      },
    });

    if (!existingDecision) {
      throw new ServiceNotFoundException(
        `Decison Meeting with UUID ${uuid} not found`,
      );
    }

    let dateHasChanged = false;
    if (
      updateData.date &&
      existingDecision.date !== new Date(updateData.date)
    ) {
      dateHasChanged = true;
      existingDecision.date = new Date(updateData.date);
    }

    if (updateData.outcome) {
      existingDecision.outcome = await this.getOutcomeByCode(
        updateData.outcome,
      );
    }
    existingDecision.auditDate = formatIncomingDate(updateData.auditDate);
    existingDecision.chairReviewDate = formatIncomingDate(
      updateData.chairReviewDate,
    );
    if (updateData.chairReviewRequired !== undefined) {
      existingDecision.chairReviewRequired = updateData.chairReviewRequired;
      if (updateData.chairReviewRequired === false) {
        existingDecision.chairReviewDate = null;
      }
    }
    const updatedDecision = await this.appDecisionRepository.save(
      existingDecision,
    );

    //If we are updating the date, we need to check if it's the first decision and if so update the application decisionDate
    if (dateHasChanged) {
      const existingDecisions = await this.getByAppFileNumber(
        existingDecision.application.fileNumber,
      );

      const decisionIndex = existingDecisions.findIndex(
        (dec) => dec.uuid === existingDecision.uuid,
      );

      if (decisionIndex === existingDecisions.length - 1) {
        await this.applicationService.updateByUuid(
          existingDecision.applicationUuid,
          {
            decisionDate: updatedDecision.date,
          },
        );
      }
    }

    return this.get(existingDecision.uuid);
  }

  async create(
    createDto: CreateApplicationDecisionDto,
    application: Application,
  ) {
    const decision = new ApplicationDecision({
      outcome: await this.getOutcomeByCode(createDto.outcome),
      date: new Date(createDto.date),
      chairReviewRequired: createDto.chairReviewRequired,
      auditDate: createDto.auditDate
        ? new Date(createDto.auditDate)
        : undefined,
      chairReviewDate: createDto.chairReviewDate
        ? new Date(createDto.chairReviewDate)
        : undefined,
      application,
    });

    const existingDecisions = await this.getByAppFileNumber(
      application.fileNumber,
    );
    if (existingDecisions.length === 0) {
      await this.applicationService.update(application, {
        decisionDate: decision.date,
      });
    }

    const savedDecision = await this.appDecisionRepository.save(decision);

    return this.get(savedDecision.uuid);
  }

  async delete(uuid) {
    const applicationDecision = await this.appDecisionRepository.findOne({
      where: { uuid },
      relations: {
        outcome: true,
        documents: {
          document: true,
        },
        application: true,
      },
    });
    for (const document of applicationDecision.documents) {
      await this.documentService.softRemove(document.document);
    }
    await this.appDecisionRepository.softRemove([applicationDecision]);

    const existingDecisions = await this.getByAppFileNumber(
      applicationDecision.application.fileNumber,
    );
    if (existingDecisions.length === 0) {
      await this.applicationService.update(applicationDecision.application, {
        decisionDate: null,
      });
    } else {
      await this.applicationService.update(applicationDecision.application, {
        decisionDate: existingDecisions[existingDecisions.length - 1].date,
      });
    }
  }

  async attachDocument(decisionUuid: string, file: MultipartFile, user: User) {
    const decision = await this.appDecisionRepository.findOne({
      where: {
        uuid: decisionUuid,
      },
    });
    if (!decision) {
      throw new ServiceNotFoundException(`Decision not found ${decisionUuid}`);
    }

    const document = await this.documentService.create(
      `decision/${decision.uuid}`,
      file,
      user,
    );
    const appDocument = new DecisionDocument({
      decision,
      document,
    });

    return this.decisionDocumentRepository.save(appDocument);
  }

  async deleteDocument(decisionDocumentUuid: string) {
    const decisionDocument = await this.getDecisionDocumentOrFail(
      decisionDocumentUuid,
    );

    await this.documentService.softRemove(decisionDocument.document);
    return decisionDocument;
  }

  async getDownloadUrl(decisionDocumentUuid: string, openInline = false) {
    const decisionDocument = await this.getDecisionDocumentOrFail(
      decisionDocumentUuid,
    );

    return this.documentService.getDownloadUrl(
      decisionDocument.document,
      openInline,
    );
  }

  private async getDecisionDocumentOrFail(decisionDocumentUuid: string) {
    const decisionDocument = await this.decisionDocumentRepository.findOne({
      where: {
        uuid: decisionDocumentUuid,
      },
      relations: {
        document: true,
      },
    });

    if (!decisionDocument) {
      throw new ServiceNotFoundException(
        `Failed to find document with uuid ${decisionDocumentUuid}`,
      );
    }
    return decisionDocument;
  }

  getOutcomeByCode(code: string) {
    return this.decisionOutcomeRepository.findOne({
      where: {
        code,
      },
    });
  }

  async getCodeMapping() {
    return this.decisionOutcomeRepository.find();
  }
}

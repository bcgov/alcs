import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { Application } from '../application.entity';
import { ApplicationService } from '../application.service';
import { ApplicationDecisionOutcome } from './application-decision-outcome.entity';
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
    @InjectRepository(ApplicationDecisionOutcome)
    private decisionOutcomeRepository: Repository<ApplicationDecisionOutcome>,
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
        documents: true,
      },
    });
  }

  async update(uuid: string, updateData: UpdateApplicationDecisionDto) {
    const existingDecision = await this.appDecisionRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        application: true,
      },
    });

    if (!existingDecision) {
      throw new ServiceNotFoundException(
        `Decison Meeting with UUID ${uuid} not found`,
      );
    }

    let dateHasChanged = false;
    if (existingDecision.date !== new Date(updateData.date)) {
      dateHasChanged = true;
      existingDecision.date = new Date(updateData.date);
    }

    existingDecision.outcome = await this.getOutcomeByCode(updateData.outcome);
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
        await this.applicationService.createOrUpdate({
          decisionDate: updatedDecision.date,
          fileNumber: existingDecision.application.fileNumber,
        });
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
      application,
    });

    const existingDecisions = await this.getByAppFileNumber(
      application.fileNumber,
    );
    if (existingDecisions.length === 0) {
      await this.applicationService.createOrUpdate({
        decisionDate: decision.date,
        fileNumber: application.fileNumber,
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
        documents: true,
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
      await this.applicationService.createOrUpdate({
        decisionDate: null,
        fileNumber: applicationDecision.application.fileNumber,
      });
    } else {
      await this.applicationService.createOrUpdate({
        decisionDate: existingDecisions[existingDecisions.length - 1].date,
        fileNumber: applicationDecision.application.fileNumber,
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

  async deleteDocument(documentUuid: string) {
    const decisionDocument = await this.decisionDocumentRepository.findOne({
      where: {
        uuid: documentUuid,
      },
      relations: {
        document: true,
      },
    });

    if (!decisionDocument) {
      throw new ServiceNotFoundException(
        `Failed to find document with uuid ${documentUuid}`,
      );
    }

    await this.documentService.softRemove(decisionDocument.document);
    return decisionDocument;
  }

  async getDownloadUrl(decisionDocumentUuid: string, openInline = false) {
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

    return this.documentService.getDownloadUrl(
      decisionDocument.document,
      openInline,
    );
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

import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Application } from '../../application/application.entity';
import { ApplicationService } from '../../application/application.service';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../common/exceptions/base.exception';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { ApplicationAmendment } from '../application-amendment/application-amendment.entity';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';
import { DecisionOutcomeCode } from './application-decision-outcome.entity';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecision } from './application-decision.entity';
import { CeoCriterionCode } from './ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from './decision-document.entity';
import { DecisionMakerCode } from './decision-maker/decision-maker.entity';

@Injectable()
export class ApplicationDecisionService {
  constructor(
    @InjectRepository(ApplicationDecision)
    private appDecisionRepository: Repository<ApplicationDecision>,
    @InjectRepository(DecisionDocument)
    private decisionDocumentRepository: Repository<DecisionDocument>,
    @InjectRepository(DecisionOutcomeCode)
    private decisionOutcomeRepository: Repository<DecisionOutcomeCode>,
    @InjectRepository(DecisionMakerCode)
    private decisionMakerRepository: Repository<DecisionMakerCode>,
    @InjectRepository(CeoCriterionCode)
    private ceoCriterionRepository: Repository<CeoCriterionCode>,
    private applicationService: ApplicationService,
    private documentService: DocumentService,
  ) {}

  async getByAppFileNumber(number: string) {
    const application = await this.applicationService.getOrFail(number);

    const records = await this.appDecisionRepository.find({
      where: {
        applicationUuid: application.uuid,
      },
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
        decisionMaker: true,
        ceoCriterion: true,
        documents: {
          document: {
            uploadedBy: true,
          },
        },
        amends: {
          amendsDecisions: true,
        },
        reconsiders: {
          reconsidersDecisions: true,
        },
        reconsideredBy: {
          resultingDecision: true,
        },
        amendedBy: {
          resultingDecision: true,
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

  async get(uuid) {
    const decision = await this.appDecisionRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        outcome: true,
        decisionMaker: true,
        ceoCriterion: true,
        documents: {
          document: true,
        },
      },
    });

    decision.documents = decision.documents.filter(
      (document) => !!document.document,
    );
    return decision;
  }

  async update(
    uuid: string,
    updateDto: UpdateApplicationDecisionDto,
    amends: ApplicationAmendment | undefined | null,
    reconsiders: ApplicationReconsideration | undefined | null,
  ) {
    const existingDecision = await this.getOrFail(uuid);

    this.validateDecisionChanges(updateDto);

    existingDecision.decisionMakerCode = updateDto.decisionMakerCode;
    existingDecision.ceoCriterionCode = updateDto.ceoCriterionCode;
    existingDecision.isTimeExtension = updateDto.isTimeExtension;
    existingDecision.auditDate = formatIncomingDate(updateDto.auditDate);
    existingDecision.chairReviewDate = formatIncomingDate(
      updateDto.chairReviewDate,
    );
    existingDecision.chairReviewOutcome = updateDto.chairReviewOutcome;
    existingDecision.amends = amends;
    existingDecision.reconsiders = reconsiders;

    if (updateDto.outcomeCode) {
      existingDecision.outcome = await this.getOutcomeByCode(
        updateDto.outcomeCode,
      );
    }

    if (updateDto.chairReviewRequired !== undefined) {
      existingDecision.chairReviewRequired = updateDto.chairReviewRequired;
      if (updateDto.chairReviewRequired === false) {
        existingDecision.chairReviewDate = null;
        existingDecision.chairReviewOutcome = null;
      }
    }

    let dateHasChanged = false;
    if (updateDto.date && existingDecision.date !== new Date(updateDto.date)) {
      dateHasChanged = true;
      existingDecision.date = new Date(updateDto.date);
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

  private async getOrFail(uuid: string) {
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
        `Decision with UUID ${uuid} not found`,
      );
    }
    return existingDecision;
  }

  private validateDecisionChanges(updateData: UpdateApplicationDecisionDto) {
    if (
      updateData.ceoCriterionCode &&
      updateData.decisionMakerCode !== 'CEOP'
    ) {
      throw new ServiceValidationException(
        'Cannot set ceo criterion code unless ceo the decision maker',
      );
    }

    if (
      updateData.ceoCriterionCode !== 'MODI' &&
      (updateData.isTimeExtension === true ||
        updateData.isTimeExtension === false)
    ) {
      throw new ServiceValidationException(
        'Cannot set time extension unless ceo criterion is modification',
      );
    }
  }

  async create(
    createDto: CreateApplicationDecisionDto,
    application: Application,
    amends: ApplicationAmendment | undefined | null,
    reconsiders: ApplicationReconsideration | undefined | null,
  ) {
    const decision = new ApplicationDecision({
      outcome: await this.getOutcomeByCode(createDto.outcomeCode),
      date: new Date(createDto.date),
      resolutionNumber: createDto.resolutionNumber,
      resolutionYear: createDto.resolutionYear,
      chairReviewRequired: createDto.chairReviewRequired,
      auditDate: createDto.auditDate
        ? new Date(createDto.auditDate)
        : undefined,
      chairReviewDate: createDto.chairReviewDate
        ? new Date(createDto.chairReviewDate)
        : undefined,
      chairReviewOutcome: createDto.chairReviewOutcome,
      ceoCriterionCode: createDto.ceoCriterionCode,
      decisionMakerCode: createDto.decisionMakerCode,
      isTimeExtension: createDto.isTimeExtension,
      application,
      amends,
      reconsiders,
    });

    this.validateDecisionChanges(createDto);

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
    const decision = await this.getOrFail(decisionUuid);
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

  async fetchCodes() {
    const values = await Promise.all([
      this.decisionOutcomeRepository.find(),
      this.decisionMakerRepository.find(),
      this.ceoCriterionRepository.find(),
    ]);

    return {
      outcomes: values[0],
      decisionMakers: values[1],
      ceoCriterion: values[2],
    };
  }

  getMany(amendedDecisionUuids: string[]) {
    return this.appDecisionRepository.find({
      where: {
        uuid: In(amendedDecisionUuids),
      },
    });
  }
}

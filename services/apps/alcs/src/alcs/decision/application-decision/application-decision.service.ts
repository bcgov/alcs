import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Application } from '../../application/application.entity';
import { ApplicationService } from '../../application/application.service';
import { DocumentService } from '../../../document/document.service';
import { User } from '../../../user/user.entity';
import { formatIncomingDate } from '../../../utils/incoming-date.formatter';
import { ApplicationModification } from '../application-modification/application-modification.entity';
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

    const decisions = await this.appDecisionRepository.find({
      where: {
        applicationUuid: application.uuid,
      },
      order: {
        date: 'DESC',
      },
      relations: {
        outcome: true,
        decisionMaker: true,
        ceoCriterion: true,
        modifies: {
          modifiesDecisions: true,
        },
        reconsiders: {
          reconsidersDecisions: true,
        },
        chairReviewOutcome: true,
      },
    });

    // do not place modifiedBy into query above, it will kill performance
    const decisionsWithModifiedBy = await this.appDecisionRepository.find({
      where: {
        applicationUuid: application.uuid,
      },
      relations: {
        modifiedBy: {
          resultingDecision: true,
          reviewOutcome: true,
        },
      },
    });

    // do not place reconsideredBy into query above, it will kill performance
    const decisionsWithReconsideredBy = await this.appDecisionRepository.find({
      where: {
        applicationUuid: application.uuid,
      },
      relations: {
        reconsideredBy: {
          resultingDecision: true,
          reviewOutcome: true,
        },
      },
    });

    for (const decision of decisions) {
      decision.reconsideredBy =
        decisionsWithReconsideredBy.find((r) => r.uuid === decision.uuid)
          ?.reconsideredBy || [];

      decision.modifiedBy =
        decisionsWithModifiedBy.find((r) => r.uuid === decision.uuid)
          ?.modifiedBy || [];
    }

    //Query Documents separately as when added to the above joins caused performance issues
    for (const decision of decisions) {
      decision.documents = await this.decisionDocumentRepository.find({
        where: {
          decisionUuid: decision.uuid,
          document: {
            auditDeletedDateAt: IsNull(),
          },
        },
        relations: {
          document: true,
        },
      });
    }
    return decisions;
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

    if (!decision) {
      throw new ServiceNotFoundException(
        `Failed to load decision with uuid ${uuid}`,
      );
    }

    decision.documents = decision.documents.filter(
      (document) => !!document.document,
    );
    return decision;
  }

  async update(
    uuid: string,
    updateDto: UpdateApplicationDecisionDto,
    modifies: ApplicationModification | undefined | null,
    reconsiders: ApplicationReconsideration | undefined | null,
  ) {
    const existingDecision: Partial<ApplicationDecision> = await this.getOrFail(
      uuid,
    );

    await this.validateDecisionChanges(updateDto);

    // resolution number is int64 in postgres, which means it is a string in JS
    if (
      updateDto.resolutionNumber &&
      updateDto.resolutionYear &&
      (existingDecision.resolutionNumber !== updateDto.resolutionNumber ||
        existingDecision.resolutionYear !== updateDto.resolutionYear)
    ) {
      await this.validateResolutionNumber(
        updateDto.resolutionNumber,
        updateDto.resolutionYear,
      );
    }

    existingDecision.decisionMakerCode = updateDto.decisionMakerCode;
    existingDecision.ceoCriterionCode = updateDto.ceoCriterionCode;
    existingDecision.isTimeExtension = updateDto.isTimeExtension;
    existingDecision.isOther = updateDto.isOther;
    existingDecision.auditDate = formatIncomingDate(updateDto.auditDate);
    existingDecision.chairReviewDate = formatIncomingDate(
      updateDto.chairReviewDate,
    );
    existingDecision.chairReviewOutcomeCode = updateDto.chairReviewOutcomeCode;
    existingDecision.modifies = modifies;
    existingDecision.reconsiders = reconsiders;
    existingDecision.resolutionNumber = updateDto.resolutionNumber;
    existingDecision.resolutionYear = updateDto.resolutionYear;

    if (updateDto.outcomeCode) {
      existingDecision.outcome = await this.getOutcomeByCode(
        updateDto.outcomeCode,
      );
    }

    if (updateDto.chairReviewRequired !== undefined) {
      existingDecision.chairReviewRequired = updateDto.chairReviewRequired;
      if (!updateDto.chairReviewRequired) {
        existingDecision.chairReviewDate = null;
        existingDecision.chairReviewOutcomeCode = null;
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
        existingDecision.application!.fileNumber,
      );

      const decisionIndex = existingDecisions.findIndex(
        (dec) => dec.uuid === existingDecision.uuid,
      );

      if (decisionIndex === existingDecisions.length - 1) {
        await this.applicationService.updateByUuid(
          existingDecision.applicationUuid!,
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

  private async validateDecisionChanges(
    updateData: UpdateApplicationDecisionDto,
  ) {
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
    modifies: ApplicationModification | undefined | null,
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
      chairReviewOutcomeCode: createDto.chairReviewOutcomeCode,
      ceoCriterionCode: createDto.ceoCriterionCode,
      decisionMakerCode: createDto.decisionMakerCode,
      isTimeExtension: createDto.isTimeExtension,
      isOther: createDto.isOther,
      application,
      modifies,
      reconsiders,
    });

    await this.validateDecisionChanges(createDto);

    await this.validateResolutionNumber(
      createDto.resolutionNumber,
      createDto.resolutionYear,
    );

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

  private async validateResolutionNumber(number, year) {
    const existingDecision = await this.appDecisionRepository.findOne({
      where: {
        resolutionNumber: number,
        resolutionYear: year,
      },
      withDeleted: true,
    });

    if (existingDecision) {
      throw new ServiceValidationException(
        `Resolution number #${number}/${year} is already in use`,
      );
    }
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

    if (!applicationDecision) {
      throw new ServiceNotFoundException(
        `Failed to find decision with uuid ${uuid}`,
      );
    }

    for (const document of applicationDecision.documents) {
      await this.documentService.softRemove(document.document);
    }

    //Clear potential links
    applicationDecision.reconsiders = null;
    applicationDecision.modifies = null;
    await this.appDecisionRepository.save(applicationDecision);

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

    await this.decisionDocumentRepository.softRemove(decisionDocument);
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
    return this.decisionOutcomeRepository.findOneOrFail({
      where: {
        code,
      },
    });
  }

  async fetchCodes() {
    const values = await Promise.all([
      this.decisionOutcomeRepository.find(),
      this.decisionMakerRepository.find({
        order: {
          label: 'ASC',
        },
      }),
      this.ceoCriterionRepository.find({
        order: {
          number: 'ASC',
        },
      }),
    ]);

    return {
      outcomes: values[0],
      decisionMakers: values[1],
      ceoCriterion: values[2],
    };
  }

  getMany(modifiesDecisionUuids: string[]) {
    return this.appDecisionRepository.find({
      where: {
        uuid: In(modifiesDecisionUuids),
      },
    });
  }
}

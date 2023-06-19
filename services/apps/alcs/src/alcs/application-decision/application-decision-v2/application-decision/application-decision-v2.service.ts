import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../../document/document.dto';
import { DocumentService } from '../../../../document/document.service';
import { User } from '../../../../user/user.entity';
import { formatIncomingDate } from '../../../../utils/incoming-date.formatter';
import { Application } from '../../../application/application.entity';
import { ApplicationService } from '../../../application/application.service';
import { ApplicationCeoCriterionCode } from '../../application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionConditionType } from '../../application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionService } from '../../application-decision-condition/application-decision-condition.service';
import { ApplicationDecisionDocument } from '../../application-decision-document/application-decision-document.entity';
import { ApplicationDecisionMakerCode } from '../../application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionOutcomeCode } from '../../application-decision-outcome.entity';
import { ApplicationDecision } from '../../application-decision.entity';
import { ApplicationModification } from '../../application-modification/application-modification.entity';
import { ApplicationReconsideration } from '../../application-reconsideration/application-reconsideration.entity';
import {
  CreateApplicationDecisionDto,
  UpdateApplicationDecisionDto,
} from './application-decision.dto';
import { ApplicationDecisionComponentType } from './component/application-decision-component-type.entity';
import { ApplicationDecisionComponent } from './component/application-decision-component.entity';
import { ApplicationDecisionComponentService } from './component/application-decision-component.service';
import { LinkedResolutionOutcomeType } from './linked-resolution-outcome-type.entity';

@Injectable()
export class ApplicationDecisionV2Service {
  constructor(
    @InjectRepository(ApplicationDecision)
    private appDecisionRepository: Repository<ApplicationDecision>,
    @InjectRepository(ApplicationDecisionDocument)
    private decisionDocumentRepository: Repository<ApplicationDecisionDocument>,
    @InjectRepository(ApplicationDecisionOutcomeCode)
    private decisionOutcomeRepository: Repository<ApplicationDecisionOutcomeCode>,
    @InjectRepository(ApplicationDecisionMakerCode)
    private decisionMakerRepository: Repository<ApplicationDecisionMakerCode>,
    @InjectRepository(ApplicationCeoCriterionCode)
    private ceoCriterionRepository: Repository<ApplicationCeoCriterionCode>,
    @InjectRepository(ApplicationDecisionComponentType)
    private decisionComponentTypeRepository: Repository<ApplicationDecisionComponentType>,
    @InjectRepository(ApplicationDecisionConditionType)
    private decisionConditionTypeRepository: Repository<ApplicationDecisionConditionType>,
    @InjectRepository(LinkedResolutionOutcomeType)
    private linkedResolutionOutcomeTypeRepository: Repository<LinkedResolutionOutcomeType>,
    private applicationService: ApplicationService,
    private documentService: DocumentService,
    private decisionComponentService: ApplicationDecisionComponentService,
    private decisionConditionService: ApplicationDecisionConditionService,
  ) {}

  async getForPortal(fileNumber: string) {
    const application = await this.applicationService.getOrFail(fileNumber);

    return await this.appDecisionRepository.find({
      where: {
        applicationUuid: application.uuid,
        isDraft: false,
      },
      relations: {
        outcome: true,
        documents: {
          document: true,
        },
        modifies: {
          modifiesDecisions: true,
        },
        reconsiders: {
          reconsidersDecisions: true,
        },
      },
      order: {
        auditCreatedAt: 'DESC',
      },
    });
  }

  async getByAppFileNumber(number: string) {
    const application = await this.applicationService.getOrFail(number);

    const decisions = await this.appDecisionRepository.find({
      where: {
        applicationUuid: application.uuid,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        outcome: true,
        decisionMaker: true,
        ceoCriterion: true,
        linkedResolutionOutcome: true,
        modifies: {
          modifiesDecisions: true,
        },
        reconsiders: {
          reconsidersDecisions: true,
        },
        chairReviewOutcome: true,
        components: {
          applicationDecisionComponentType: true,
        },
      },
    });

    // do not place modifiedBy into query above, it will kill performance
    const decisionsWithModifiedBy = await this.appDecisionRepository.find({
      where: {
        applicationUuid: application.uuid,
        modifiedBy: {
          resultingDecision: {
            isDraft: false,
          },
        },
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
        reconsideredBy: {
          resultingDecision: {
            isDraft: false,
          },
        },
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
        linkedResolutionOutcome: true,
        documents: {
          document: true,
        },
        modifies: {
          modifiesDecisions: true,
        },
        reconsiders: {
          reconsidersDecisions: true,
        },
        components: {
          applicationDecisionComponentType: true,
        },
        conditions: {
          type: true,
        },
        chairReviewOutcome: true,
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
    existingDecision.isSubjectToConditions = updateDto.isSubjectToConditions;
    existingDecision.decisionDescription = updateDto.decisionDescription;
    existingDecision.isStatsRequired = updateDto.isStatsRequired;
    existingDecision.daysHideFromPublic = updateDto.daysHideFromPublic;
    existingDecision.isDraft = updateDto.isDraft;
    existingDecision.rescindedDate = formatIncomingDate(
      updateDto.rescindedDate,
    );
    existingDecision.rescindedComment = updateDto.rescindedComment;
    existingDecision.wasReleased =
      existingDecision.wasReleased || !updateDto.isDraft;
    existingDecision.linkedResolutionOutcomeCode =
      updateDto.linkedResolutionOutcomeCode;

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
    if (
      updateDto.date &&
      existingDecision.date !== new Date(updateDto.date) &&
      !existingDecision.isDraft
    ) {
      dateHasChanged = true;
      existingDecision.date = new Date(updateDto.date);
    }

    await this.updateComponents(updateDto, existingDecision);

    //Must be called after update components
    await this.updateConditions(updateDto, existingDecision);

    const updatedDecision = await this.appDecisionRepository.save(
      existingDecision,
      { transaction: true },
    );

    //If we are updating the date, we need to check if it's the first decision and if so update the application decisionDate
    const existingDecisions = await this.getByAppFileNumber(
      existingDecision.application!.fileNumber,
    );
    if (dateHasChanged) {
      const decisionIndex = existingDecisions.findIndex(
        (dec) => dec.uuid === existingDecision.uuid,
      );

      if (
        decisionIndex === existingDecisions.length - 1 &&
        existingDecisions.filter((e) => !e.isDraft).length > 0 &&
        updatedDecision
      ) {
        await this.applicationService.updateByUuid(
          existingDecision.applicationUuid!,
          {
            decisionDate: updatedDecision.date,
          },
        );
      }
    } else if (
      updatedDecision.isDraft &&
      existingDecisions.filter((e) => !e.isDraft).length < 1
    ) {
      await this.applicationService.updateByUuid(
        existingDecision.applicationUuid!,
        {
          decisionDate: null,
        },
      );
    }

    return this.get(existingDecision.uuid);
  }

  private async updateComponents(
    updateDto: UpdateApplicationDecisionDto,
    existingDecision: Partial<ApplicationDecision>,
  ) {
    if (updateDto.decisionComponents) {
      this.decisionComponentService.validate(
        updateDto.decisionComponents,
        updateDto.isDraft,
      );

      if (existingDecision?.components) {
        const componentsToRemove = existingDecision.components.filter(
          (component) =>
            !updateDto.decisionComponents?.some(
              (componentDto) => componentDto.uuid === component.uuid,
            ),
        );

        await this.decisionComponentService.softRemove(componentsToRemove);
      }

      existingDecision.components =
        await this.decisionComponentService.createOrUpdate(
          updateDto.decisionComponents,
          false,
        );
    } else if (
      updateDto.decisionComponents === null &&
      existingDecision.components
    ) {
      await this.decisionComponentService.softRemove(
        existingDecision.components,
      );
    }
  }

  private async updateConditions(
    updateDto: UpdateApplicationDecisionDto,
    existingDecision: Partial<ApplicationDecision>,
  ) {
    if (updateDto.conditions) {
      if (existingDecision.applicationUuid && existingDecision.conditions) {
        const conditionsToRemove = existingDecision.conditions.filter(
          (condition) =>
            !updateDto.conditions?.some(
              (conditionDto) => conditionDto.uuid === condition.uuid,
            ),
        );

        await this.decisionConditionService.remove(conditionsToRemove);
      }

      const existingComponents =
        await this.decisionComponentService.getAllByApplicationUuid(
          existingDecision.applicationUuid!,
        );

      existingDecision.conditions =
        await this.decisionConditionService.createOrUpdate(
          updateDto.conditions,
          existingComponents,
          existingDecision.components ?? [],
          false,
        );
    } else if (existingDecision.conditions) {
      await this.decisionConditionService.remove(existingDecision.conditions);
    }
  }

  private async getOrFail(uuid: string) {
    const existingDecision = await this.appDecisionRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        application: true,
        components: true,
        conditions: true,
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
    const isDraftExists = await this.appDecisionRepository.exist({
      where: {
        application: { fileNumber: createDto.applicationFileNumber },
        isDraft: true,
      },
    });

    if (isDraftExists) {
      throw new ServiceValidationException(
        'Draft decision already exists for this application.',
      );
    }

    let decisionComponents: ApplicationDecisionComponent[] = [];
    if (createDto.decisionComponents) {
      this.decisionComponentService.validate(
        createDto.decisionComponents,
        createDto.isDraft,
      );
      decisionComponents = await this.decisionComponentService.createOrUpdate(
        createDto.decisionComponents,
        false,
      );
    }

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
      linkedResolutionOutcomeCode: createDto.linkedResolutionOutcomeCode,
      ceoCriterionCode: createDto.ceoCriterionCode,
      decisionMakerCode: createDto.decisionMakerCode,
      isTimeExtension: createDto.isTimeExtension,
      isOther: createDto.isOther,
      isDraft: true,
      isSubjectToConditions: createDto.isSubjectToConditions,
      decisionDescription: createDto.decisionDescription,
      isStatsRequired: createDto.isStatsRequired,
      daysHideFromPublic: createDto.daysHideFromPublic,
      rescindedDate: createDto.rescindedDate
        ? new Date(createDto.rescindedDate)
        : null,
      rescindedComment: createDto.rescindedComment,
      application,
      modifies,
      reconsiders,
      components: decisionComponents,
    });

    await this.validateDecisionChanges(createDto);

    await this.validateResolutionNumber(
      createDto.resolutionNumber,
      createDto.resolutionYear,
    );

    const savedDecision = await this.appDecisionRepository.save(decision, {
      transaction: true,
    });

    return this.get(savedDecision.uuid);
  }

  private async validateResolutionNumber(number, year) {
    // we do not need to validate decision without number
    if (!number) {
      return;
    }

    // we do not need to include deleted items since there may be multiple deleted draft decision wih the same or different numbers
    const existingDecision = await this.appDecisionRepository.findOne({
      where: {
        resolutionNumber: number,
        resolutionYear: year ?? IsNull(),
      },
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
        components: true,
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

    await this.decisionComponentService.softRemove(
      applicationDecision.components,
    );

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
      file.filename,
      file,
      user,
      DOCUMENT_SOURCE.ALC,
      DOCUMENT_SYSTEM.ALCS,
    );
    const appDocument = new ApplicationDecisionDocument({
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
      this.decisionComponentTypeRepository.find(),
      this.decisionConditionTypeRepository.find(),
      this.linkedResolutionOutcomeTypeRepository.find(),
    ]);

    return {
      outcomes: values[0],
      decisionMakers: values[1],
      ceoCriterion: values[2],
      decisionComponentTypes: values[3],
      decisionConditionTypes: values[4],
      linkedResolutionOutcomeType: values[5],
    };
  }

  getMany(modifiesDecisionUuids: string[]) {
    return this.appDecisionRepository.find({
      where: {
        uuid: In(modifiesDecisionUuids),
      },
    });
  }

  async generateResolutionNumber(resolutionYear: number) {
    const result = await this.appDecisionRepository.query(
      `SELECT * FROM alcs.generate_next_resolution_number(${resolutionYear})`,
    );

    return result[0].generate_next_resolution_number;
  }
}

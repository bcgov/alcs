import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { DocumentService } from '../../../document/document.service';
import { User } from '../../../user/user.entity';
import { formatIncomingDate } from '../../../utils/incoming-date.formatter';
import { NOI_SUBMISSION_STATUS } from '../../notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntent } from '../../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecisionComponentType } from '../notice-of-intent-decision-component/notice-of-intent-decision-component-type.entity';
import { NoticeOfIntentDecisionComponent } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecisionComponentService } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.service';
import { NoticeOfIntentDecisionConditionType } from '../notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import { NoticeOfIntentDecisionConditionService } from '../notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { NoticeOfIntentDecisionDocument } from '../notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from '../notice-of-intent-decision-outcome.entity';
import {
  CreateNoticeOfIntentDecisionDto,
  UpdateNoticeOfIntentDecisionDto,
} from '../notice-of-intent-decision.dto';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';
import { NoticeOfIntentModification } from '../notice-of-intent-modification/notice-of-intent-modification.entity';

@Injectable()
export class NoticeOfIntentDecisionV2Service {
  constructor(
    @InjectRepository(NoticeOfIntentDecision)
    private noticeOfIntentDecisionRepository: Repository<NoticeOfIntentDecision>,
    @InjectRepository(NoticeOfIntentDecisionDocument)
    private decisionDocumentRepository: Repository<NoticeOfIntentDecisionDocument>,
    @InjectRepository(NoticeOfIntentDecisionOutcome)
    private decisionOutcomeRepository: Repository<NoticeOfIntentDecisionOutcome>,
    @InjectRepository(NoticeOfIntentDecisionComponentType)
    private decisionComponentTypeRepository: Repository<NoticeOfIntentDecisionComponentType>,
    @InjectRepository(NoticeOfIntentDecisionConditionType)
    private decisionConditionTypeRepository: Repository<NoticeOfIntentDecisionConditionType>,
    private noticeOfIntentService: NoticeOfIntentService,
    private documentService: DocumentService,
    private decisionComponentService: NoticeOfIntentDecisionComponentService,
    private decisionConditionService: NoticeOfIntentDecisionConditionService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
  ) {}

  async getForPortal(fileNumber: string) {
    const uuid = await this.noticeOfIntentService.getUuid(fileNumber);

    return await this.noticeOfIntentDecisionRepository.find({
      where: {
        noticeOfIntentUuid: uuid,
        isDraft: false,
      },
      relations: {
        outcome: true,
        documents: {
          document: true,
        },
      },
      order: {
        auditCreatedAt: 'DESC',
      },
    });
  }

  async getByFileNumber(number: string) {
    const noticeOfIntentUuid = await this.noticeOfIntentService.getUuid(number);

    const decisions = await this.noticeOfIntentDecisionRepository.find({
      where: {
        noticeOfIntentUuid,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        outcome: true,
        modifies: {
          modifiesDecisions: true,
        },
        components: {
          noticeOfIntentDecisionComponentType: true,
        },
        conditions: {
          type: true,
          components: true,
        },
      },
    });

    // do not place modifiedBy into query above, it will kill performance
    const decisionsWithModifiedBy =
      await this.noticeOfIntentDecisionRepository.find({
        where: {
          noticeOfIntentUuid,
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

    for (const decision of decisions) {
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
    const decision = await this.noticeOfIntentDecisionRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        outcome: true,
        documents: {
          document: true,
        },
        modifies: {
          modifiesDecisions: true,
        },
        components: {
          noticeOfIntentDecisionComponentType: true,
        },
        conditions: {
          type: true,
          components: true,
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
    updateDto: UpdateNoticeOfIntentDecisionDto,
    modifies: NoticeOfIntentModification | undefined | null,
  ) {
    const existingDecision: Partial<NoticeOfIntentDecision> =
      await this.getOrFail(uuid);

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

    const isChangingDraftStatus =
      existingDecision.isDraft !== updateDto.isDraft;

    existingDecision.auditDate = formatIncomingDate(updateDto.auditDate);
    existingDecision.modifies = modifies;
    existingDecision.decisionMaker = updateDto.decisionMaker;
    existingDecision.decisionMakerName = updateDto.decisionMakerName;
    existingDecision.resolutionNumber = updateDto.resolutionNumber;
    existingDecision.resolutionYear = updateDto.resolutionYear;
    existingDecision.isSubjectToConditions = updateDto.isSubjectToConditions;
    existingDecision.decisionDescription = updateDto.decisionDescription;
    existingDecision.isStatsRequired = updateDto.isStatsRequired;
    existingDecision.isDraft = updateDto.isDraft;
    existingDecision.rescindedDate = formatIncomingDate(
      updateDto.rescindedDate,
    );
    existingDecision.rescindedComment = updateDto.rescindedComment;
    existingDecision.wasReleased =
      existingDecision.wasReleased || !updateDto.isDraft;

    if (updateDto.outcomeCode) {
      existingDecision.outcome = await this.getOutcomeByCode(
        updateDto.outcomeCode,
      );
    }

    let dateHasChanged = false;
    if (
      updateDto.date !== undefined &&
      existingDecision.date !== formatIncomingDate(updateDto.date)
    ) {
      dateHasChanged = true;
      existingDecision.date = formatIncomingDate(updateDto.date);
    }

    await this.updateComponents(updateDto, existingDecision);

    //Must be called after update components
    await this.updateConditions(updateDto, existingDecision);

    const updatedDecision = await this.noticeOfIntentDecisionRepository.save(
      existingDecision,
    );

    if (dateHasChanged || isChangingDraftStatus) {
      await this.updateDecisionDates(updatedDecision);
    }

    return this.get(existingDecision.uuid);
  }

  async create(
    createDto: CreateNoticeOfIntentDecisionDto,
    noticeOfIntent: NoticeOfIntent,
    modifies: NoticeOfIntentModification | undefined | null,
  ) {
    const isDraftExists = await this.noticeOfIntentDecisionRepository.exist({
      where: {
        noticeOfIntent: { fileNumber: createDto.fileNumber },
        isDraft: true,
      },
    });

    if (isDraftExists) {
      throw new ServiceValidationException(
        'Draft decision already exists for this notice of intent.',
      );
    }

    let decisionComponents: NoticeOfIntentDecisionComponent[] = [];
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

    const decision = new NoticeOfIntentDecision({
      outcome: await this.getOutcomeByCode(createDto.outcomeCode ?? 'APPR'),
      date: createDto.date ? new Date(createDto.date) : null,
      resolutionNumber: createDto.resolutionNumber,
      resolutionYear: createDto.resolutionYear,
      decisionMaker: createDto.decisionMaker,
      decisionMakerName: createDto.decisionMakerName,
      auditDate: createDto.auditDate
        ? new Date(createDto.auditDate)
        : undefined,
      isDraft: true,
      isSubjectToConditions: createDto.isSubjectToConditions,
      decisionDescription: createDto.decisionDescription,
      isStatsRequired: createDto.isStatsRequired,
      rescindedDate: createDto.rescindedDate
        ? new Date(createDto.rescindedDate)
        : null,
      rescindedComment: createDto.rescindedComment,
      noticeOfIntent,
      modifies,
      components: decisionComponents,
    });

    await this.validateResolutionNumber(
      createDto.resolutionNumber,
      createDto.resolutionYear,
    );

    const savedDecision = await this.noticeOfIntentDecisionRepository.save(
      decision,
      {
        transaction: true,
      },
    );

    return this.get(savedDecision.uuid);
  }

  private async validateResolutionNumber(number, year) {
    // we do not need to validate decision without number
    if (!number) {
      return;
    }

    // we do not need to include deleted items since there may be multiple deleted draft decision wih the same or different numbers
    const existingDecision =
      await this.noticeOfIntentDecisionRepository.findOne({
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
    const noticeOfIntentDecision =
      await this.noticeOfIntentDecisionRepository.findOne({
        where: { uuid },
        relations: {
          outcome: true,
          documents: {
            document: true,
          },
          noticeOfIntent: true,
          components: true,
        },
      });

    if (!noticeOfIntentDecision) {
      throw new ServiceNotFoundException(
        `Failed to find decision with uuid ${uuid}`,
      );
    }

    for (const document of noticeOfIntentDecision.documents) {
      await this.documentService.softRemove(document.document);
    }

    await this.decisionComponentService.softRemove(
      noticeOfIntentDecision.components,
    );

    //Clear potential links
    noticeOfIntentDecision.modifies = null;
    await this.noticeOfIntentDecisionRepository.save(noticeOfIntentDecision);

    await this.noticeOfIntentDecisionRepository.softRemove([
      noticeOfIntentDecision,
    ]);
    await this.updateDecisionDates(noticeOfIntentDecision);
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
    const appDocument = new NoticeOfIntentDecisionDocument({
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
      this.decisionComponentTypeRepository.find(),
      this.decisionConditionTypeRepository.find(),
    ]);

    return {
      outcomes: values[0],
      decisionComponentTypes: values[1],
      decisionConditionTypes: values[2],
    };
  }

  getMany(modifiesDecisionUuids: string[]) {
    return this.noticeOfIntentDecisionRepository.find({
      where: {
        uuid: In(modifiesDecisionUuids),
      },
    });
  }

  async generateResolutionNumber(resolutionYear: number) {
    const result = await this.noticeOfIntentDecisionRepository.query(
      `SELECT * FROM alcs.generate_next_resolution_number(${resolutionYear})`,
    );

    return result[0].generate_next_resolution_number;
  }

  private async updateComponents(
    updateDto: UpdateNoticeOfIntentDecisionDto,
    existingDecision: Partial<NoticeOfIntentDecision>,
  ) {
    if (updateDto.decisionComponents) {
      if (
        existingDecision.outcomeCode &&
        ['APPA', 'APPR'].includes(existingDecision.outcomeCode)
      ) {
        this.decisionComponentService.validate(
          updateDto.decisionComponents,
          updateDto.isDraft,
        );
      }

      if (existingDecision.components) {
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
    updateDto: UpdateNoticeOfIntentDecisionDto,
    existingDecision: Partial<NoticeOfIntentDecision>,
  ) {
    if (updateDto.conditions) {
      if (existingDecision.noticeOfIntentUuid && existingDecision.conditions) {
        const conditionsToRemove = existingDecision.conditions.filter(
          (condition) =>
            !updateDto.conditions?.some(
              (conditionDto) => conditionDto.uuid === condition.uuid,
            ),
        );

        await this.decisionConditionService.remove(conditionsToRemove);
      }

      const existingComponents =
        await this.decisionComponentService.getAllByNoticeOfIntentUUID(
          existingDecision.noticeOfIntentUuid!,
        );

      existingDecision.conditions =
        await this.decisionConditionService.createOrUpdate(
          updateDto.conditions,
          existingComponents,
          existingDecision.components ?? [],
          false,
        );
    } else if (updateDto.conditions === null && existingDecision.conditions) {
      await this.decisionConditionService.remove(existingDecision.conditions);
    }
  }

  private async getOrFail(uuid: string) {
    const existingDecision =
      await this.noticeOfIntentDecisionRepository.findOne({
        where: {
          uuid,
        },
        relations: {
          noticeOfIntent: true,
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

  private async updateDecisionDates(
    noticeOfIntentDecision: NoticeOfIntentDecision,
  ) {
    const existingDecisions = await this.getByFileNumber(
      noticeOfIntentDecision.noticeOfIntent.fileNumber,
    );
    const releasedDecisions = existingDecisions.filter(
      (decision) => !decision.isDraft,
    );
    if (releasedDecisions.length === 0) {
      await this.noticeOfIntentService.updateByUuid(
        noticeOfIntentDecision.noticeOfIntent.uuid,
        {
          decisionDate: null,
        },
      );

      await this.noticeOfIntentSubmissionStatusService.setStatusDateByFileNumber(
        noticeOfIntentDecision.noticeOfIntent.fileNumber,
        NOI_SUBMISSION_STATUS.ALC_DECISION,
        null,
      );
    } else {
      const decisionDate = existingDecisions[existingDecisions.length - 1].date;
      await this.noticeOfIntentService.updateByUuid(
        noticeOfIntentDecision.noticeOfIntent.uuid,
        {
          decisionDate,
        },
      );

      await this.setDecisionReleasedStatus(
        decisionDate,
        noticeOfIntentDecision,
      );
    }
  }

  private async setDecisionReleasedStatus(
    decisionDate: Date | null,
    noticeOfIntentDecision: NoticeOfIntentDecision,
  ) {
    await this.noticeOfIntentSubmissionStatusService.setStatusDateByFileNumber(
      noticeOfIntentDecision.noticeOfIntent.fileNumber,
      NOI_SUBMISSION_STATUS.ALC_DECISION,
      decisionDate,
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

  async updateDocument(documentUuid: string, fileName: string) {
    const document = await this.getDecisionDocumentOrFail(documentUuid);
    await this.documentService.update(document.document, {
      fileName,
      source: DOCUMENT_SOURCE.ALC,
    });
  }
}

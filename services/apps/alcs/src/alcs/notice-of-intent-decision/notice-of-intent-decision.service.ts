import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM } from '../../document/document.dto';
import { DocumentService } from '../../document/document.service';
import { User } from '../../user/user.entity';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { filterUndefined } from '../../utils/undefined';
import { ApplicationModification } from '../application-decision/application-modification/application-modification.entity';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecisionDocument } from './notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from './notice-of-intent-decision-outcome.entity';
import { NoticeOfIntentDecision } from './notice-of-intent-decision.entity';
import {
  CreateNoticeOfIntentDecisionDto,
  UpdateNoticeOfIntentDecisionDto,
} from './notice-of-intent-decision.dto';
import { NoticeOfIntentModification } from './notice-of-intent-modification/notice-of-intent-modification.entity';

@Injectable()
export class NoticeOfIntentDecisionService {
  constructor(
    @InjectRepository(NoticeOfIntentDecision)
    private appDecisionRepository: Repository<NoticeOfIntentDecision>,
    @InjectRepository(NoticeOfIntentDecisionDocument)
    private decisionDocumentRepository: Repository<NoticeOfIntentDecisionDocument>,
    @InjectRepository(NoticeOfIntentDecisionOutcome)
    private decisionOutcomeRepository: Repository<NoticeOfIntentDecisionOutcome>,
    private noticeOfIntentService: NoticeOfIntentService,
    private documentService: DocumentService,
  ) {}

  async getByFileNumber(fileNumber: string) {
    const noticeOfIntent = await this.noticeOfIntentService.getByFileNumber(
      fileNumber,
    );

    const decisions = await this.appDecisionRepository.find({
      where: {
        noticeOfIntentUuid: noticeOfIntent.uuid,
      },
      order: {
        date: 'DESC',
      },
      relations: {
        modifies: {
          modifiesDecisions: true,
        },
        outcome: true,
      },
    });

    // do not place modifiedBy into query above, it will kill performance
    const decisionsWithModifiedBy = await this.appDecisionRepository.find({
      where: {
        noticeOfIntentUuid: noticeOfIntent.uuid,
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
    const decision = await this.appDecisionRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        outcome: true,
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

  async update(uuid: string, updateDto: UpdateNoticeOfIntentDecisionDto) {
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

    existingDecision.auditDate = formatIncomingDate(updateDto.auditDate);
    existingDecision.resolutionNumber = updateDto.resolutionNumber;
    existingDecision.resolutionYear = updateDto.resolutionYear;
    existingDecision.decisionMaker = filterUndefined(
      updateDto.decisionMaker,
      undefined,
    );
    existingDecision.decisionMakerName = filterUndefined(
      updateDto.decisionMakerName,
      undefined,
    );

    if (updateDto.outcomeCode) {
      existingDecision.outcome = await this.getOutcomeByCode(
        updateDto.outcomeCode,
      );
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
      const existingDecisions = await this.getByFileNumber(
        existingDecision.noticeOfIntent!.fileNumber,
      );

      const decisionIndex = existingDecisions.findIndex(
        (dec) => dec.uuid === existingDecision.uuid,
      );

      if (decisionIndex === existingDecisions.length - 1) {
        await this.noticeOfIntentService.updateByUuid(
          existingDecision.noticeOfIntentUuid!,
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
        noticeOfIntent: true,
      },
    });

    if (!existingDecision) {
      throw new ServiceNotFoundException(
        `Decision with UUID ${uuid} not found`,
      );
    }
    return existingDecision;
  }

  async create(
    createDto: CreateNoticeOfIntentDecisionDto,
    noticeOfIntent: NoticeOfIntent,
    modifies: NoticeOfIntentModification | undefined | null,
  ) {
    const decision = new NoticeOfIntentDecision({
      outcome: await this.getOutcomeByCode(createDto.outcomeCode),
      date: new Date(createDto.date),
      resolutionNumber: createDto.resolutionNumber,
      resolutionYear: createDto.resolutionYear,
      decisionMaker: filterUndefined(createDto.decisionMaker, undefined),
      decisionMakerName: filterUndefined(
        createDto.decisionMakerName,
        undefined,
      ),
      modifies,
      noticeOfIntent,
    });

    await this.validateResolutionNumber(
      createDto.resolutionNumber,
      createDto.resolutionYear,
    );

    const existingDecisions = await this.getByFileNumber(
      noticeOfIntent.fileNumber,
    );

    if (existingDecisions.length === 0) {
      await this.noticeOfIntentService.updateByUuid(noticeOfIntent.uuid, {
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
    const noticeOfIntentDecision = await this.appDecisionRepository.findOne({
      where: { uuid },
      relations: {
        outcome: true,
        documents: {
          document: true,
        },
        noticeOfIntent: true,
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

    //Clear potential links
    await this.appDecisionRepository.save(noticeOfIntentDecision);
    await this.appDecisionRepository.softRemove([noticeOfIntentDecision]);

    const existingDecisions = await this.getByFileNumber(
      noticeOfIntentDecision.noticeOfIntent.fileNumber,
    );
    if (existingDecisions.length === 0) {
      await this.noticeOfIntentService.updateByUuid(
        noticeOfIntentDecision.noticeOfIntentUuid,
        {
          decisionDate: null,
        },
      );
    } else {
      await this.noticeOfIntentService.updateByUuid(
        noticeOfIntentDecision.noticeOfIntentUuid,
        {
          decisionDate: existingDecisions[existingDecisions.length - 1].date,
        },
      );
    }
  }

  async attachDocument(decisionUuid: string, file: MultipartFile, user: User) {
    const decision = await this.getOrFail(decisionUuid);
    const document = await this.documentService.create(
      `noi-decision/${decision.uuid}`,
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
    const values = await Promise.all([this.decisionOutcomeRepository.find()]);
    return {
      outcomes: values[0],
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

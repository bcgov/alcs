import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { MultipartFile } from '@fastify/multipart';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
} from '../../../document/document.dto';
import { DocumentService } from '../../../document/document.service';
import { User } from '../../../user/user.entity';
import { formatIncomingDate } from '../../../utils/incoming-date.formatter';
import { PlanningReviewService } from '../planning-review.service';
import { PlanningReviewDecisionDocument } from './planning-review-decision-document/planning-review-decision-document.entity';
import { PlanningReviewDecisionOutcomeCode } from './planning-review-decision-outcome.entity';
import {
  CreatePlanningReviewDecisionDto,
  UpdatePlanningReviewDecisionDto,
} from './planning-review-decision.dto';
import { PlanningReviewDecision } from './planning-review-decision.entity';

@Injectable()
export class PlanningReviewDecisionService {
  constructor(
    @InjectRepository(PlanningReviewDecision)
    private planningReviewDecisionRepository: Repository<PlanningReviewDecision>,
    @InjectRepository(PlanningReviewDecisionDocument)
    private decisionDocumentRepository: Repository<PlanningReviewDecisionDocument>,
    @InjectRepository(PlanningReviewDecisionOutcomeCode)
    private decisionOutcomeRepository: Repository<PlanningReviewDecisionOutcomeCode>,
    private planningReviewService: PlanningReviewService,
    private documentService: DocumentService,
  ) {}

  async getByFileNumber(fileNumber: string) {
    const planningReview =
      await this.planningReviewService.getByFileNumber(fileNumber);

    const decisions = await this.planningReviewDecisionRepository.find({
      where: {
        planningReviewUuid: planningReview.uuid,
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        outcome: true,
      },
    });

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
    const decision = await this.planningReviewDecisionRepository.findOne({
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

  async update(uuid: string, updateDto: UpdatePlanningReviewDecisionDto) {
    const existingDecision: Partial<PlanningReviewDecision> =
      await this.getOrFail(uuid);

    const isChangingDraftStatus =
      existingDecision.isDraft !== updateDto.isDraft;
    existingDecision.resolutionNumber = updateDto.resolutionNumber;
    existingDecision.resolutionYear = updateDto.resolutionYear;
    existingDecision.decisionDescription = updateDto.decisionDescription;
    existingDecision.isDraft = updateDto.isDraft;
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

    const updatedDecision =
      await this.planningReviewDecisionRepository.save(existingDecision);

    if (dateHasChanged || isChangingDraftStatus) {
      await this.updateDecisionDates(updatedDecision);
    }

    return this.get(existingDecision.uuid);
  }

  async create(createDto: CreatePlanningReviewDecisionDto) {
    const isDraftExists = await this.planningReviewDecisionRepository.exists({
      where: {
        planningReview: { fileNumber: createDto.planningReviewFileNumber },
        isDraft: true,
      },
    });

    if (isDraftExists) {
      throw new ServiceValidationException(
        'Draft decision already exists for this planning review.',
      );
    }

    const planningReview = await this.planningReviewService.getByFileNumber(
      createDto.planningReviewFileNumber,
    );

    const decision = new PlanningReviewDecision({
      resolutionYear: new Date().getFullYear(),
      planningReviewUuid: planningReview.uuid,
    });

    const savedDecision = await this.planningReviewDecisionRepository.save(
      decision,
      {
        transaction: true,
      },
    );

    return this.get(savedDecision.uuid);
  }

  async delete(uuid) {
    const planningReviewDecision =
      await this.planningReviewDecisionRepository.findOne({
        where: { uuid },
        relations: {
          outcome: true,
          documents: {
            document: true,
          },
          planningReview: true,
        },
      });

    if (!planningReviewDecision) {
      throw new ServiceNotFoundException(
        `Failed to find decision with uuid ${uuid}`,
      );
    }

    for (const document of planningReviewDecision.documents) {
      await this.documentService.softRemove(document.document);
    }
    await this.planningReviewDecisionRepository.save(planningReviewDecision);

    await this.planningReviewDecisionRepository.softRemove([
      planningReviewDecision,
    ]);
    await this.updateDecisionDates(planningReviewDecision);
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
    const appDocument = new PlanningReviewDecisionDocument({
      decision,
      document,
    });

    return this.decisionDocumentRepository.save(appDocument);
  }

  async deleteDocument(decisionDocumentUuid: string) {
    const decisionDocument =
      await this.getDecisionDocumentOrFail(decisionDocumentUuid);

    await this.decisionDocumentRepository.softRemove(decisionDocument);
    return decisionDocument;
  }

  async getDownloadUrl(decisionDocumentUuid: string, openInline = false) {
    const decisionDocument =
      await this.getDecisionDocumentOrFail(decisionDocumentUuid);

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
    const values = await Promise.all([this.decisionOutcomeRepository.find()]);

    return {
      outcomes: values[0],
    };
  }

  async generateResolutionNumber(resolutionYear: number) {
    const result = await this.planningReviewDecisionRepository.query(
      `SELECT * FROM alcs.generate_next_resolution_number(${resolutionYear})`,
    );

    return result[0].generate_next_resolution_number;
  }

  private async getOrFail(uuid: string) {
    const existingDecision =
      await this.planningReviewDecisionRepository.findOne({
        where: {
          uuid,
        },
        relations: {
          planningReview: true,
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
    planningReviewDecision: PlanningReviewDecision,
  ) {
    const fileNumber = planningReviewDecision.planningReview.fileNumber;
    const existingDecisions = await this.getByFileNumber(fileNumber);
    const releasedDecisions = existingDecisions.filter(
      (decision) => !decision.isDraft,
    );
    if (releasedDecisions.length === 0) {
      await this.planningReviewService.update(fileNumber, {
        decisionDate: null,
      });
    } else {
      const decisionDate = existingDecisions[existingDecisions.length - 1].date;
      await this.planningReviewService.update(fileNumber, {
        decisionDate: decisionDate?.getTime(),
      });
    }
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

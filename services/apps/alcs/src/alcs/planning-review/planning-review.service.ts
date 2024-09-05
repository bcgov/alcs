import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { FindOptionsRelations, Repository } from 'typeorm';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { filterUndefined } from '../../utils/undefined';
import { Board } from '../board/board.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { CardService } from '../card/card.service';
import { CodeService } from '../code/code.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { PlanningReferral } from './planning-referral/planning-referral.entity';
import { PlanningReviewType } from './planning-review-type.entity';
import {
  CreatePlanningReviewDto,
  PlanningReviewDto,
  UpdatePlanningReviewDto,
} from './planning-review.dto';
import { PlanningReview } from './planning-review.entity';
import { CARD_STATUS } from '../card/card-status/card-status.entity';

@Injectable()
export class PlanningReviewService {
  constructor(
    private cardService: CardService,
    @InjectRepository(PlanningReview)
    private reviewRepository: Repository<PlanningReview>,
    @InjectRepository(PlanningReviewType)
    private typeRepository: Repository<PlanningReviewType>,
    @InjectRepository(PlanningReferral)
    private referralRepository: Repository<PlanningReferral>,
    @InjectMapper() private mapper: Mapper,
    private fileNumberService: FileNumberService,
    private governmentService: LocalGovernmentService,
    private codeService: CodeService,
  ) {}

  private DEFAULT_RELATIONS: FindOptionsRelations<PlanningReview> = {
    localGovernment: true,
    region: true,
    type: true,
  };

  private excludeStatuses = [
    CARD_STATUS.INCOMING,
    CARD_STATUS.INCOMING_PRELIM_REVIEW,
    CARD_STATUS.DECISION_RELEASED,
    CARD_STATUS.CANCELLED,
    CARD_STATUS.PRELIM_DONE,
  ];

  async create(data: CreatePlanningReviewDto, board: Board) {
    const fileNumber = await this.fileNumberService.generateNextFileNumber();
    const type = await this.typeRepository.findOneOrFail({
      where: {
        code: data.typeCode,
      },
    });
    const planningReview = new PlanningReview({
      type,
      localGovernmentUuid: data.localGovernmentUuid,
      fileNumber: fileNumber,
      regionCode: data.regionCode,
      documentName: data.documentName,
    });

    const savedReview = await this.reviewRepository.save(planningReview);

    const referral = new PlanningReferral({
      planningReview: savedReview,
      dueDate: formatIncomingDate(data.dueDate),
      submissionDate: formatIncomingDate(data.submissionDate)!,
      referralDescription: data.description,
      card: await this.cardService.create(CARD_TYPE.PLAN, board, false),
    });
    return await this.referralRepository.save(referral);
  }

  async getOrFail(uuid: string) {
    const planningReview = await this.get(uuid);
    if (!planningReview) {
      throw new ServiceNotFoundException(
        `Failed to find planning meeting with uuid ${uuid}`,
      );
    }

    return planningReview;
  }

  mapToDtos(planningReviews: PlanningReview[]) {
    return this.mapper.mapArrayAsync(
      planningReviews,
      PlanningReview,
      PlanningReviewDto,
    );
  }

  getByFileNumber(fileNumber: string) {
    return this.reviewRepository.findOneOrFail({
      where: {
        fileNumber,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getDetailedReview(fileNumber: string) {
    return this.reviewRepository.findOneOrFail({
      where: {
        fileNumber,
      },
      relations: {
        ...this.DEFAULT_RELATIONS,
        referrals: {
          card: {
            board: true,
            type: true,
            subtasks: {
              type: true,
            },
          },
        },
        meetings: {
          type: true,
        },
      },
      order: {
        referrals: {
          auditCreatedAt: 'DESC',
        },
      },
    });
  }

  private get(uuid: string) {
    return this.reviewRepository.findOne({
      where: {
        uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async listTypes() {
    return this.typeRepository.find({
      order: {
        label: 'ASC',
      },
    });
  }

  async update(
    fileNumber: string,
    updateDto: UpdatePlanningReviewDto,
    user?: User,
  ) {
    const existingReview = await this.reviewRepository.findOneOrFail({
      where: {
        fileNumber,
      },
    });

    if (!updateDto.open && existingReview.open) {
      existingReview.closedDate = new Date();
      if (user) {
        existingReview.closedBy = user;
      }
    }

    if (updateDto.open && !existingReview.open) {
      existingReview.closedDate = null;
      existingReview.closedBy = null;
    }

    existingReview.open = filterUndefined(updateDto.open, existingReview.open);
    existingReview.typeCode = filterUndefined(
      updateDto.typeCode,
      existingReview.typeCode,
    );

    if (updateDto.localGovernmentUuid) {
      existingReview.localGovernment = await this.governmentService.getByUuid(
        updateDto.localGovernmentUuid,
      );
    }

    if (updateDto.regionCode) {
      existingReview.region = await this.codeService.fetchRegion(
        updateDto.regionCode,
      );
    }

    await this.reviewRepository.save(existingReview);
    return this.getDetailedReview(fileNumber);
  }

  async getFileNumber(planningReviewUuid: string) {
    return this.reviewRepository.findOneOrFail({
      where: {
        uuid: planningReviewUuid,
      },
      select: ['fileNumber'],
    });
  }

  async getIncomingPlanningReviewFiles(): Promise<
    {
      file_number: string;
      applicant: string;
      code: string;
      name: string;
      given_name: string;
      family_name: string;
      high_priority: boolean;
      active_days: number;
    }[]
  > {
    const query = `
      WITH filtered_planning_reviews AS (
        SELECT pr.uuid FROM alcs.planning_review pr
        INNER JOIN alcs.planning_referral prf ON prf.planning_review_uuid = pr.uuid
        LEFT JOIN alcs.planning_review_meeting prm ON prm.planning_review_uuid = pr."uuid" 
        INNER JOIN alcs.card c ON c."uuid" = prf.card_uuid
        WHERE c.status_code NOT IN (${this.excludeStatuses.map((_, index) => `$${index + 1}`).join(', ')})
        GROUP BY pr.uuid
        HAVING COUNT(prm.uuid) = 0
        OR COUNT(CASE WHEN prm.audit_deleted_date_at IS NULL THEN 1 END) = 0
      )
      SELECT pr.file_number, pr.document_name as applicant, board.code, u.name, u.given_name, u.family_name, c.high_priority, 0 as active_days from alcs.planning_review pr 
      INNER JOIN filtered_planning_reviews fpr on fpr.uuid = pr.uuid
      INNER JOIN alcs.planning_referral prf on prf.planning_review_uuid = pr.uuid
      INNER JOIN alcs.card c ON c."uuid" = prf.card_uuid
      INNER JOIN alcs.board board on c.board_uuid = board.uuid
      LEFT JOIN alcs.user u on u.uuid = c.assignee_uuid
      WHERE board.code = 'exec'
      ORDER BY c.high_priority desc;
    `;
    return await this.reviewRepository.query(query, this.excludeStatuses);
  }
}

import {
  ServiceNotFoundException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { Board } from '../board/board.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { CardService } from '../card/card.service';
import {
  CreatePlanningReviewDto,
  PlanningReviewDto,
} from './planning-review.dto';
import { PlanningReview } from './planning-review.entity';

@Injectable()
export class PlanningReviewService {
  constructor(
    private cardService: CardService,
    @InjectRepository(PlanningReview)
    private repository: Repository<PlanningReview>,
    @InjectMapper() private mapper: Mapper,
  ) {}

  private DEFAULT_RELATIONS: FindOptionsRelations<PlanningReview> = {
    card: {
      board: true,
      type: true,
      status: true,
      assignee: true,
    },
    localGovernment: true,
    region: true,
  };

  async create(data: CreatePlanningReviewDto, board: Board) {
    const existingMeeting = await this.repository.findOne({
      where: {
        fileNumber: data.fileNumber,
      },
    });
    if (existingMeeting) {
      throw new ServiceValidationException(
        `Planning meeting already exists with File ID ${data.fileNumber}`,
      );
    }

    const planingMeeting = new PlanningReview({
      type: data.type,
      localGovernmentUuid: data.localGovernmentUuid,
      fileNumber: data.fileNumber,
      regionCode: data.regionCode,
    });

    planingMeeting.card = await this.cardService.create(
      CARD_TYPE.PLAN,
      board,
      false,
    );
    const savedMeeting = await this.repository.save(planingMeeting);

    return this.getOrFail(savedMeeting.uuid);
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

  async getByCardUuid(cardUuid: string) {
    const planningReview = await this.repository.findOne({
      where: { cardUuid },
      relations: this.DEFAULT_RELATIONS,
    });

    if (!planningReview) {
      throw new ServiceNotFoundException(
        `Failed to find planning meeting with card uuid ${cardUuid}`,
      );
    }

    return planningReview;
  }

  getBy(findOptions: FindOptionsWhere<PlanningReview>) {
    return this.repository.find({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getDeletedCards(fileNumber: string) {
    return this.repository.find({
      where: {
        fileNumber,
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  private get(uuid: string) {
    return this.repository.findOne({
      where: {
        uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByBoard(boardUuid: string) {
    const res = await this.repository.find({
      relations: this.DEFAULT_RELATIONS,
      where: {
        card: {
          boardUuid,
          auditDeletedDateAt: IsNull(),
        },
      },
    });
    //Typeorm bug its returning deleted cards
    return res.filter((review) => !!review.card);
  }

  async getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.repository.find({
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              code: subtaskType,
            },
          },
        },
      },
      relations: {
        card: {
          status: true,
          board: true,
          type: true,
          subtasks: { type: true, assignee: true },
        },
      },
    });
  }
}

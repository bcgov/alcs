import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import {
  FindOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { formatIncomingDate } from '../../../utils/incoming-date.formatter';
import { filterUndefined } from '../../../utils/undefined';
import { Board } from '../../board/board.entity';
import { CARD_SUBTASK_TYPE } from '../../card/card-subtask/card-subtask.dto';
import { CARD_TYPE } from '../../card/card-type/card-type.entity';
import { CardService } from '../../card/card.service';
import {
  CreatePlanningReferralDto,
  PlanningReferralDto,
  UpdatePlanningReferralDto,
} from '../planning-review.dto';
import { PlanningReview } from '../planning-review.entity';
import { PlanningReferral } from './planning-referral.entity';

@Injectable()
export class PlanningReferralService {
  constructor(
    @InjectRepository(PlanningReferral)
    private referralRepository: Repository<PlanningReferral>,
    @InjectRepository(PlanningReview)
    private reviewRepository: Repository<PlanningReview>,
    @InjectMapper()
    private mapper: Mapper,
    private cardService: CardService,
  ) {}

  private DEFAULT_RELATIONS: FindOptionsRelations<PlanningReferral> = {
    card: {
      type: true,
      status: true,
      board: true,
      assignee: true,
    },
    planningReview: {
      localGovernment: true,
      region: true,
      type: true,
    },
  };

  async getByBoard(boardUuid: string) {
    return this.referralRepository.find({
      where: {
        card: {
          boardUuid,
        },
      },
      relations: {
        card: {
          type: true,
          status: true,
          board: true,
          assignee: true,
        },
        planningReview: {
          localGovernment: true,
          region: true,
          type: true,
          meetings: true,
        },
      },
    });
  }

  async mapToDtos(planningReferrals: PlanningReferral[]) {
    return this.mapper.mapArray(
      planningReferrals,
      PlanningReferral,
      PlanningReferralDto,
    );
  }

  get(uuid: string) {
    return this.referralRepository.findOneOrFail({
      where: {
        uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByCardUuid(uuid: string) {
    return this.referralRepository.findOneOrFail({
      where: {
        cardUuid: uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getDeletedCards(fileNumber: string) {
    return this.referralRepository.find({
      where: {
        planningReview: {
          fileNumber: fileNumber,
        },
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async create(createDto: CreatePlanningReferralDto, board: Board) {
    const review = await this.reviewRepository.findOneOrFail({
      where: {
        uuid: createDto.planningReviewUuid,
      },
    });

    const referral = new PlanningReferral({
      planningReview: review,
      dueDate: formatIncomingDate(createDto.dueDate),
      submissionDate: formatIncomingDate(createDto.submissionDate)!,
      referralDescription: createDto.referralDescription,
      card: await this.cardService.create(CARD_TYPE.PLAN, board, false),
    });

    await this.referralRepository.save(referral);

    return this.get(referral.uuid);
  }

  async update(uuid: string, updateDto: UpdatePlanningReferralDto) {
    const existingReferral = await this.referralRepository.findOneOrFail({
      where: {
        uuid,
      },
    });

    existingReferral.referralDescription = filterUndefined(
      updateDto.referralDescription,
      existingReferral.referralDescription,
    );
    existingReferral.responseDescription = filterUndefined(
      updateDto.responseDescription,
      existingReferral.responseDescription,
    );

    existingReferral.responseDate = formatIncomingDate(updateDto.responseDate);
    existingReferral.dueDate = formatIncomingDate(updateDto.dueDate);

    if (updateDto.submissionDate) {
      existingReferral.submissionDate = <Date>(
        formatIncomingDate(updateDto.submissionDate)
      );
    }

    await this.referralRepository.save(existingReferral);
  }

  async delete(uuid: string) {
    const existingReferral = await this.referralRepository.findOneOrFail({
      where: {
        uuid,
      },
    });

    await this.referralRepository.softRemove(existingReferral);
  }

  async getBy(assignedFindOptions: FindOptionsWhere<PlanningReferral>) {
    return this.referralRepository.find({
      where: assignedFindOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getWithIncompleteSubtaskByType(subtaskType: CARD_SUBTASK_TYPE) {
    return this.referralRepository.find({
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
        planningReview: {
          type: true,
          localGovernment: true,
        },
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

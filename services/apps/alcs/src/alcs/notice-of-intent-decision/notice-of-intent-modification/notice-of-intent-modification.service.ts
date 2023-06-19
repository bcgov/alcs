import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
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
import { Board } from '../../board/board.entity';
import { CARD_TYPE } from '../../card/card-type/card-type.entity';
import { CardService } from '../../card/card.service';
import { NoticeOfIntentService } from '../../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecisionService } from '../notice-of-intent-decision.service';
import {
  NoticeOfIntentModificationCreateDto,
  NoticeOfIntentModificationDto,
  NoticeOfIntentModificationUpdateDto,
} from './notice-of-intent-modification.dto';
import { NoticeOfIntentModification } from './notice-of-intent-modification.entity';

@Injectable()
export class NoticeOfIntentModificationService {
  constructor(
    @InjectRepository(NoticeOfIntentModification)
    private modificationRepository: Repository<NoticeOfIntentModification>,
    @InjectMapper() private mapper: Mapper,
    private noticeOfIntentService: NoticeOfIntentService,
    private noticeOfIntentDecisionService: NoticeOfIntentDecisionService,
    private cardService: CardService,
  ) {}

  private BOARD_RECONSIDERATION_RELATIONS: FindOptionsRelations<NoticeOfIntentModification> =
    {
      noticeOfIntent: {
        region: true,
        localGovernment: true,
      },
      card: {
        board: true,
        type: true,
        status: true,
        assignee: true,
      },
    };

  private DEFAULT_RELATIONS: FindOptionsRelations<NoticeOfIntentModification> =
    {
      noticeOfIntent: {
        region: true,
        localGovernment: true,
      },
      card: {
        board: true,
        type: true,
        status: true,
        assignee: true,
      },
      modifiesDecisions: true,
      resultingDecision: true,
      reviewOutcome: true,
    };

  getByBoard(boardUuid: string) {
    return this.modificationRepository.find({
      where: { card: { boardUuid } },
      relations: this.BOARD_RECONSIDERATION_RELATIONS,
    });
  }

  getByFileNumber(fileNumber: string) {
    return this.getBy({ noticeOfIntent: { fileNumber: fileNumber } });
  }

  getBy(findOptions: FindOptionsWhere<NoticeOfIntentModification>) {
    return this.modificationRepository.find({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getDeletedCards(fileNumber: string) {
    return this.modificationRepository.find({
      where: {
        noticeOfIntent: {
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

  mapToDtos(
    modifications: NoticeOfIntentModification[],
  ): Promise<NoticeOfIntentModificationDto[]> {
    return this.mapper.mapArrayAsync(
      modifications,
      NoticeOfIntentModification,
      NoticeOfIntentModificationDto,
    );
  }

  async create(createDto: NoticeOfIntentModificationCreateDto, board: Board) {
    const modification = new NoticeOfIntentModification({
      submittedDate: new Date(createDto.submittedDate),
    });

    modification.card = await this.cardService.create(
      CARD_TYPE.NOI_MODI,
      board,
      false,
    );
    modification.noticeOfIntent =
      await this.noticeOfIntentService.getByFileNumber(createDto.fileNumber);
    modification.modifiesDecisions =
      await this.noticeOfIntentDecisionService.getMany(
        createDto.modifiesDecisionUuids,
      );

    const mockModifications = await this.modificationRepository.save(
      modification,
    );
    return this.getByUuid(mockModifications.uuid);
  }

  async update(uuid: string, updateDto: NoticeOfIntentModificationUpdateDto) {
    const modification = await this.getByUuidOrFail(uuid);

    if (updateDto.submittedDate) {
      modification.submittedDate = new Date(updateDto.submittedDate);
    }
    if (updateDto.reviewDate !== undefined) {
      modification.reviewDate = updateDto.reviewDate
        ? new Date(updateDto.reviewDate)
        : null;
    }

    if (updateDto.outcomeNotificationDate !== undefined) {
      modification.outcomeNotificationDate = updateDto.outcomeNotificationDate
        ? new Date(updateDto.outcomeNotificationDate)
        : null;
    }

    if (updateDto.reviewOutcomeCode) {
      modification.reviewOutcomeCode = updateDto.reviewOutcomeCode;
    }

    if (updateDto.modifiesDecisionUuids) {
      modification.modifiesDecisions =
        await this.noticeOfIntentDecisionService.getMany(
          updateDto.modifiesDecisionUuids,
        );
    }

    await this.modificationRepository.save(modification);
    return this.getByUuid(uuid);
  }

  async delete(uuid: string) {
    const modification = await this.getByUuidOrFail(uuid);
    return this.modificationRepository.softRemove([modification]);
  }

  private async getByUuidOrFail(uuid: string) {
    const modification = await this.modificationRepository.findOneBy({
      uuid,
    });

    if (!modification) {
      throw new ServiceNotFoundException(
        `Modification with uuid ${uuid} not found`,
      );
    }

    return modification;
  }

  getByCardUuid(cardUuid: string) {
    return this.getOneByOrFail({ cardUuid });
  }

  getByUuid(uuid: string) {
    return this.getOneByOrFail({ uuid });
  }

  getOneByOrFail(findOptions: FindOptionsWhere<NoticeOfIntentModification>) {
    return this.modificationRepository.findOneOrFail({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.modificationRepository.find({
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
        noticeOfIntent: {
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

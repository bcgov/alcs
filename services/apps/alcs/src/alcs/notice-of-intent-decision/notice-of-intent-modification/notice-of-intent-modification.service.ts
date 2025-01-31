import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { FindOptionsRelations, FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { filterUndefined } from '../../../utils/undefined';
import { Board } from '../../board/board.entity';
import { CARD_TYPE } from '../../card/card-type/card-type.entity';
import { CardService } from '../../card/card.service';
import { NoticeOfIntentService } from '../../notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentDecisionV2Service } from '../notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import {
  NoticeOfIntentModificationCreateDto,
  NoticeOfIntentModificationDto,
  NoticeOfIntentModificationUpdateDto,
} from './notice-of-intent-modification.dto';
import { NoticeOfIntentModification } from './notice-of-intent-modification.entity';

@Injectable()
export class NoticeOfIntentModificationService {
  private BOARD_RECONSIDERATION_RELATIONS: FindOptionsRelations<NoticeOfIntentModification> = {
    noticeOfIntent: {
      region: true,
      localGovernment: true,
    },
    card: {
      board: false,
      type: true,
      status: true,
      assignee: true,
    },
  };
  private DEFAULT_RELATIONS: FindOptionsRelations<NoticeOfIntentModification> = {
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

  constructor(
    @InjectRepository(NoticeOfIntentModification)
    private modificationRepository: Repository<NoticeOfIntentModification>,
    @InjectMapper() private mapper: Mapper,
    private noticeOfIntentService: NoticeOfIntentService,
    @Inject(forwardRef(() => NoticeOfIntentDecisionV2Service))
    private noticeOfIntentDecisionService: NoticeOfIntentDecisionV2Service,
    @Inject(forwardRef(() => CardService))
    private cardService: CardService,
  ) {}

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

  mapToDtos(modifications: NoticeOfIntentModification[]): Promise<NoticeOfIntentModificationDto[]> {
    return this.mapper.mapArrayAsync(modifications, NoticeOfIntentModification, NoticeOfIntentModificationDto);
  }

  async create(createDto: NoticeOfIntentModificationCreateDto, board: Board) {
    const modification = new NoticeOfIntentModification({
      submittedDate: new Date(createDto.submittedDate),
      description: createDto.description,
    });

    modification.card = await this.cardService.create(CARD_TYPE.NOI_MODI, board, false);
    modification.noticeOfIntent = await this.noticeOfIntentService.getByFileNumber(createDto.fileNumber);
    modification.modifiesDecisions = await this.noticeOfIntentDecisionService.getMany(createDto.modifiesDecisionUuids);

    const mockModifications = await this.modificationRepository.save(modification);
    return this.getByUuid(mockModifications.uuid);
  }

  async update(uuid: string, updateDto: NoticeOfIntentModificationUpdateDto) {
    const modification = await this.getByUuidOrFail(uuid);

    if (updateDto.submittedDate) {
      modification.submittedDate = new Date(updateDto.submittedDate);
    }

    if (updateDto.reviewOutcomeCode) {
      modification.reviewOutcomeCode = updateDto.reviewOutcomeCode;
    }

    modification.description = filterUndefined(updateDto.description, modification.description);

    if (updateDto.modifiesDecisionUuids) {
      modification.modifiesDecisions = await this.noticeOfIntentDecisionService.getMany(
        updateDto.modifiesDecisionUuids,
      );
    }

    await this.modificationRepository.save(modification);
    return this.getByUuid(uuid);
  }

  async delete(uuid: string) {
    const modification = await this.getByUuidOrFail(uuid);
    if (modification.cardUuid) {
      await this.cardService.archive(modification.cardUuid);
    }

    return this.modificationRepository.softRemove([modification]);
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

  private async getByUuidOrFail(uuid: string) {
    const modification = await this.modificationRepository.findOneBy({
      uuid,
    });

    if (!modification) {
      throw new ServiceNotFoundException(`Modification with uuid ${uuid} not found`);
    }

    return modification;
  }

  async getByNoticeOfIntentDecisionUuid(decisionUuid: string): Promise<NoticeOfIntentModification[]> {
    return this.modificationRepository.find({
      where: {
        modifiesDecisions: {
          uuid: decisionUuid,
        },
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }
}

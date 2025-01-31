import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  NoticeOfIntentDecisionConditionCardBoardDto,
  CreateNoticeOfIntentDecisionConditionCardDto,
  UpdateNoticeOfIntentDecisionConditionCardDto,
} from './notice-of-intent-decision-condition-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeOfIntentDecisionConditionCard } from './notice-of-intent-decision-condition-card.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { CardService } from '../../../card/card.service';
import { NoticeOfIntentDecisionConditionService } from '../notice-of-intent-decision-condition.service';
import { BoardService } from '../../../board/board.service';
import {
  ServiceInternalErrorException,
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import { Card } from '../../../card/card.entity';
import { CARD_TYPE } from '../../../card/card-type/card-type.entity';
import { Board } from '../../../board/board.entity';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { ApplicationType } from '../../../code/application-code/application-type/application-type.entity';
import { ApplicationTypeDto } from '../../../code/application-code/application-type/application-type.dto';
import { NoticeOfIntentDecision } from '../../notice-of-intent-decision.entity';
import { NoticeOfIntentModificationService } from '../../notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDecisionV2Service } from '../../notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';

@Injectable()
export class NoticeOfIntentDecisionConditionCardService {
  CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  BOARD_CARD_RELATIONS = {
    card: this.CARD_RELATIONS,
    conditions: true,
    decision: {
      noticeOfIntent: {
        type: true,
      },
    },
  };

  DEFAULT_RELATIONS = {
    conditions: true,
    card: this.CARD_RELATIONS,
    decision: {
      noticeOfIntent: true,
    },
  };

  constructor(
    @InjectRepository(NoticeOfIntentDecisionConditionCard)
    private repository: Repository<NoticeOfIntentDecisionConditionCard>,
    private noticeOfIntentDecisionConditionService: NoticeOfIntentDecisionConditionService,
    @Inject(forwardRef(() => NoticeOfIntentDecisionV2Service))
    private noticeOfIntentDecisionService: NoticeOfIntentDecisionV2Service,
    private boardService: BoardService,
    @Inject(forwardRef(() => CardService))
    private cardService: CardService,
    private noticeOfIntentModificationService: NoticeOfIntentModificationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async create(dto: CreateNoticeOfIntentDecisionConditionCardDto) {
    let board: Board;
    try {
      board = await this.boardService.getNoticeOfIntentDecisionConditionBoard();
    } catch (error) {
      throw new ServiceNotFoundException('Failed to fetch Notice of Intent Decision Condition Board');
    }

    if (!board.statuses.find((status) => status.statusCode === dto.cardStatusCode)) {
      throw new ServiceValidationException(`Invalid card status code: ${dto.cardStatusCode}`);
    }

    let decision: NoticeOfIntentDecision;
    try {
      decision = await this.noticeOfIntentDecisionService.get(dto.decisionUuid);
    } catch (error) {
      throw new ServiceNotFoundException(`Failed to fetch decision with uuid ${dto.decisionUuid}`);
    }

    const card = new Card();
    card.typeCode = CARD_TYPE.NOI_CON;
    card.statusCode = dto.cardStatusCode;
    card.boardUuid = board.uuid;
    const newCard = await this.cardService.save(card);

    if (!newCard) {
      throw new ServiceInternalErrorException('Failed to create card');
    }

    const conditions = await this.noticeOfIntentDecisionConditionService.findByUuids(dto.conditionsUuids);

    if (conditions.length !== dto.conditionsUuids.length) {
      throw new ServiceValidationException('Failed to fetch all conditions');
    }

    const noticeOfIntentDecisionConditionCard = new NoticeOfIntentDecisionConditionCard();
    noticeOfIntentDecisionConditionCard.cardUuid = newCard.uuid;
    noticeOfIntentDecisionConditionCard.conditions = conditions;
    noticeOfIntentDecisionConditionCard.decision = decision;

    return this.repository.save(noticeOfIntentDecisionConditionCard);
  }

  async get(uuid: string): Promise<NoticeOfIntentDecisionConditionCard> {
    const noticeOfIntentDecisionConditionCard = await this.repository.findOne({
      where: { uuid },
      relations: this.DEFAULT_RELATIONS,
    });

    if (!noticeOfIntentDecisionConditionCard) {
      throw new ServiceNotFoundException(`NoticeOfIntentDecisionConditionCard with uuid ${uuid} not found`);
    }

    return noticeOfIntentDecisionConditionCard;
  }

  async update(uuid: string, dto: UpdateNoticeOfIntentDecisionConditionCardDto) {
    const noticeOfIntentDecisionConditionCard = await this.get(uuid);

    if (dto.conditionsUuids && dto.conditionsUuids.length > 0) {
      const conditions = await this.noticeOfIntentDecisionConditionService.findByUuids(dto.conditionsUuids);

      if (conditions.length !== dto.conditionsUuids.length) {
        throw new ServiceValidationException('Failed to fetch all conditions');
      }

      noticeOfIntentDecisionConditionCard.conditions = conditions;
    }

    if (dto.cardStatusCode) {
      let board: Board;
      try {
        board = await this.boardService.getNoticeOfIntentDecisionConditionBoard();
      } catch (error) {
        throw new ServiceNotFoundException('Failed to fetch Notice of Intent Decision Condition Board');
      }

      if (!board.statuses.find((status) => status.statusCode === dto.cardStatusCode)) {
        throw new ServiceValidationException(`Invalid card status code: ${dto.cardStatusCode}`);
      }

      noticeOfIntentDecisionConditionCard.card.statusCode = dto.cardStatusCode;
    }

    return this.repository.save(noticeOfIntentDecisionConditionCard);
  }

  async softRemove(decisionConditionCard: NoticeOfIntentDecisionConditionCard) {
    const card = await this.cardService.get(decisionConditionCard.cardUuid);
    if (!card) {
      throw new ServiceNotFoundException(`Card with uuid ${decisionConditionCard.cardUuid} not found`);
    }

    await this.cardService.softRemoveByUuid(card.uuid);
    return this.repository.softRemove(decisionConditionCard);
  }

  async getByBoard(boardUuid: string): Promise<NoticeOfIntentDecisionConditionCard[]> {
    return await this.repository.find({
      where: { card: { boardUuid } },
      relations: this.BOARD_CARD_RELATIONS,
    });
  }

  async getByBoardCard(uuid: string): Promise<NoticeOfIntentDecisionConditionCard> {
    const res = await this.repository.findOne({ where: { cardUuid: uuid }, relations: this.BOARD_CARD_RELATIONS });
    if (!res) {
      throw new ServiceNotFoundException(`Could not find card with UUID ${uuid}`);
    }

    return res;
  }

  async mapToBoardDtos(noticeOfIntentDecisionConditionCards: NoticeOfIntentDecisionConditionCard[]) {
    const dtos = noticeOfIntentDecisionConditionCards.map((card) => {
      const dto = this.mapper.map(
        card,
        NoticeOfIntentDecisionConditionCard,
        NoticeOfIntentDecisionConditionCardBoardDto,
      );
      dto.applicant = card.decision.noticeOfIntent.applicant;
      dto.fileNumber = card.decision.noticeOfIntent.fileNumber;
      dto.type = this.mapper.map(card.decision.noticeOfIntent.type, ApplicationType, ApplicationTypeDto);
      return dto;
    });

    for (const dto of dtos) {
      const appModifications = await this.noticeOfIntentModificationService.getByNoticeOfIntentDecisionUuid(
        dto.decisionUuid,
      );

      dto.isModification = appModifications.length > 0;

      for (const condition of dto.conditions) {
        const status = await this.noticeOfIntentDecisionService.getDecisionConditionStatus(condition.uuid);
        condition.status = status !== '' ? status : undefined;
      }
    }
    return dtos;
  }

  async archiveByBoardCard(boardCardUuid: string) {
    const decisionConditionCard = await this.getByBoardCard(boardCardUuid);

    if (!decisionConditionCard) {
      throw new ServiceNotFoundException(`Card with uuid ${boardCardUuid} not found`);
    }
    decisionConditionCard.conditions = [];
    await this.repository.save(decisionConditionCard);

    await this.repository.softRemove(decisionConditionCard);
  }

  async recoverByBoardCard(boardCardUuid: string) {
    const decisionConditionCard = await this.repository.findOne({
      where: { cardUuid: boardCardUuid },
      withDeleted: true,
      relations: this.DEFAULT_RELATIONS,
    });

    if (!decisionConditionCard) {
      throw new ServiceNotFoundException(`Card with uuid ${boardCardUuid} not found`);
    }

    await this.repository.recover(decisionConditionCard);
  }

  async getDeletedCards(fileNumber: string) {
    return this.repository.find({
      where: {
        decision: {
          noticeOfIntent: {
            fileNumber,
          },
        },
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
      relations: {
        decision: {
          noticeOfIntent: true,
        },
        card: this.CARD_RELATIONS,
      },
    });
  }
}

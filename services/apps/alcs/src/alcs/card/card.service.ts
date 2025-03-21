import { CONFIG_TOKEN } from '@app/common/config/config.module';
import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { condition, Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { IConfig } from 'config';
import { FindOptionsRelations, Not, Repository } from 'typeorm';
import { User } from '../../user/user.entity';
import { Board } from '../board/board.entity';
import { MessageService } from '../message/message.service';
import { CardSubtaskService } from './card-subtask/card-subtask.service';
import { CARD_TYPE, CardType } from './card-type/card-type.entity';
import { CardDetailedDto, CardDto, CardUpdateServiceDto } from './card.dto';
import { Card } from './card.entity';
import { ApplicationDecisionCondition } from '../application-decision/application-decision-condition/application-decision-condition.entity';
import { ApplicationDecisionConditionCardService } from '../application-decision/application-decision-condition/application-decision-condition-card/application-decision-condition-card.service';
import { NoticeOfIntentDecisionConditionCardService } from '../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.service';

@Injectable()
export class CardService {
  private DEFAULT_RELATIONS: FindOptionsRelations<Card> = {
    type: true,
    status: true,
    assignee: true,
  };
  private logger = new Logger(CardService.name);

  constructor(
    @InjectMapper() private mapper: Mapper,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardType)
    private cardTypeRepository: Repository<CardType>,
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private subtaskService: CardSubtaskService,
    private notificationService: MessageService,
    @Inject(forwardRef(() => ApplicationDecisionConditionCardService))
    private applicationDecisionConditionCardService: ApplicationDecisionConditionCardService,
    @Inject(forwardRef(() => NoticeOfIntentDecisionConditionCardService))
    private noticeOfIntentDecisionConditionCardService: NoticeOfIntentDecisionConditionCardService,
  ) {}

  async getCardTypes() {
    return await this.cardTypeRepository.find({
      select: {
        code: true,
        label: true,
      },
    });
  }

  async getPortalCardTypes() {
    return await this.cardTypeRepository.find({
      select: {
        code: true,
        portalHtmlDescription: true,
        label: true,
      },
      where: {
        portalHtmlDescription: Not(''),
      },
    });
  }

  get(uuid: string) {
    return this.cardRepository.findOne({
      where: { uuid },
      relations: {
        ...this.DEFAULT_RELATIONS,
        subtasks: {
          type: true,
          assignee: true,
        },
      },
      order: {
        subtasks: {
          createdAt: 'ASC',
        },
      },
    });
  }

  getWithBoard(uuid: string) {
    return this.cardRepository.findOne({
      where: { uuid },
      relations: {
        ...this.DEFAULT_RELATIONS,
        board: true,
        subtasks: {
          type: true,
          assignee: true,
        },
      },
      order: {
        subtasks: {
          createdAt: 'ASC',
        },
      },
    });
  }

  async update(
    user: User,
    cardUuid: string,
    updateDto: CardUpdateServiceDto,
    notificationBody?: string,
  ): Promise<Card> {
    const existingCard = await this.cardRepository.findOne({
      where: { uuid: cardUuid },
      relations: {
        board: true,
        type: true,
      },
    });

    if (!existingCard) {
      throw new ServiceValidationException(`Card for with ${cardUuid} not found`);
    }

    const shouldCreateNotification =
      updateDto.assigneeUuid &&
      updateDto.assigneeUuid !== existingCard.assigneeUuid &&
      updateDto.assigneeUuid !== user.uuid;

    const updatedCard = Object.assign(existingCard, updateDto);
    const savedCard = await this.cardRepository.save(updatedCard);

    if (shouldCreateNotification) {
      const frontEnd = this.config.get('ALCS.FRONTEND_ROOT');
      this.notificationService.create({
        actor: user,
        receiverUuid: savedCard.assigneeUuid,
        title: "You've been assigned",
        body: notificationBody ?? `Assigned to a ${savedCard.type.label}`,
        link: `${frontEnd}/board/${savedCard.board.code}?card=${savedCard.uuid}&type=${savedCard.typeCode}`,
        targetType: 'card',
      });
    }

    return savedCard;
  }

  async create(typeCode: CARD_TYPE, board: Board, persist = true) {
    const type = await this.cardTypeRepository.findOne({
      where: {
        code: typeCode,
      },
    });

    if (!type) {
      throw new ServiceValidationException(`Provided type does not exist ${typeCode}`);
    }

    const newCard = new Card();
    newCard.statusCode = board.statuses.reduce((prev, curr) => (prev.order < curr.order ? prev : curr))?.status.code;
    newCard.typeCode = typeCode;
    newCard.boardUuid = board.uuid;

    if (persist) {
      return this.cardRepository.save(newCard);
    } else {
      return newCard;
    }
  }

  async getByBoard(boardCode: string) {
    return this.cardRepository.find({
      where: { board: { code: boardCode } },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async mapToDtos(cards: Card[]) {
    return this.mapper.mapArray(cards, Card, CardDto);
  }

  async mapToDetailedDto(card: Card) {
    return this.mapper.map(card, Card, CardDetailedDto);
  }

  async archive(uuid: string) {
    const card = await this.cardRepository.findOneOrFail({
      where: {
        uuid,
      },
      relations: {
        subtasks: true,
      },
    });

    const subtaskUuids = card.subtasks.map((subtask) => subtask.uuid);
    await this.subtaskService.deleteMany(subtaskUuids);

    if (card.typeCode === CARD_TYPE.APP_CON) {
      await this.applicationDecisionConditionCardService.archiveByBoardCard(card.uuid);
    }

    if (card.typeCode === CARD_TYPE.NOI_CON) {
      await this.noticeOfIntentDecisionConditionCardService.archiveByBoardCard(card.uuid);
    }

    card.archived = true;
    await this.cardRepository.save(card);
    await this.cardRepository.softRemove(card);
  }

  async save(card: Card) {
    await this.cardRepository.save(card);
    return this.get(card.uuid);
  }

  async recover(uuid: string) {
    const card = await this.cardRepository.findOneOrFail({
      where: {
        uuid,
      },
      relations: {
        subtasks: true,
      },
      withDeleted: true,
    });

    const subtaskUuids = card.subtasks.map((subtask) => subtask.uuid);
    await this.subtaskService.recoverMany(subtaskUuids);

    if (card.typeCode === CARD_TYPE.APP_CON) {
      await this.applicationDecisionConditionCardService.recoverByBoardCard(card.uuid);
    }

    if (card.typeCode === CARD_TYPE.NOI_CON) {
      await this.noticeOfIntentDecisionConditionCardService.recoverByBoardCard(card.uuid);
    }

    card.archived = false;
    await this.cardRepository.save(card);
    await this.cardRepository.recover(card);
  }

  async getByCardStatus(code: string) {
    return this.cardRepository.find({
      where: { statusCode: code },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async softRemoveByUuid(uuid: string) {
    const card = await this.cardRepository.findOneOrFail({
      where: { uuid },
    });
    await this.cardRepository.softRemove(card);
  }
}

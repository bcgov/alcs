import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Not, Repository } from 'typeorm';
import { Board } from '../board/board.entity';
import { CardSubtaskService } from './card-subtask/card-subtask.service';
import { CardType } from './card-type/card-type.entity';
import { CardDetailedDto, CardDto, CardUpdateServiceDto } from './card.dto';
import { Card } from './card.entity';

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
    private subtaskService: CardSubtaskService,
  ) {}

  async getCardTypes() {
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
    });
  }

  async update(cardUuid, card: CardUpdateServiceDto): Promise<Card> {
    const existingCard = await this.cardRepository.findOne({
      where: { uuid: cardUuid },
    });

    if (!existingCard) {
      throw new ServiceValidationException(
        `Card for with ${cardUuid} not found`,
      );
    }

    const updatedCard = Object.assign(existingCard, card);

    return this.cardRepository.save(updatedCard);
  }

  async create(typeCode: string, board: Board, persist = true) {
    const type = await this.cardTypeRepository.findOne({
      where: {
        code: typeCode,
      },
    });

    if (!type) {
      throw new ServiceValidationException(
        `Provided type does not exist ${typeCode}`,
      );
    }

    const newCard = new Card();
    newCard.statusCode = board.statuses.reduce((prev, curr) =>
      prev.order < curr.order ? prev : curr,
    )?.status.code;
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

    card.archived = true;
    await this.cardRepository.save(card);
    await this.cardRepository.softRemove(card);
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

    card.archived = false;
    await this.cardRepository.save(card);
    await this.cardRepository.recover(card);
  }
}

import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { RedisService } from '@app/common/redis/redis.service';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClientType } from 'redis';
import { FindOptionsRelations, Not, Repository } from 'typeorm';
import { Board } from '../board/board.entity';
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
    private redisService: RedisService,
  ) {
    this.loadCardTypesToRedis();
  }

  private async loadCardTypesToRedis() {
    const cardTypes = await this.cardTypeRepository.find({
      select: {
        code: true,
        portalHtmlDescription: true,
        label: true,
      },
      where: {
        portalHtmlDescription: Not(''),
      },
    });

    const jsonBlob = JSON.stringify(cardTypes);
    const redis = this.redisService.getClient() as RedisClientType;
    await redis.set('cardTypes', jsonBlob);
    this.logger.debug(`Loaded ${cardTypes.length} card types into Redis`);
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
}

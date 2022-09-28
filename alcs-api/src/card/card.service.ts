import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Board } from '../board/board.entity';
import { ServiceValidationException } from '../common/exceptions/base.exception';
import { CardType } from './card-type/card-type.entity';
import { CardCreateDto, CardDto, CardUpdateDto } from './card.dto';
import { Card } from './card.entity';

@Injectable()
export class CardService {
  private logger = new Logger(CardService.name);
  private DEFAULT_RELATIONS: FindOptionsRelations<Card> = {
    type: true,
    status: true,
    assignee: true,
  };

  constructor(
    @InjectMapper() private mapper: Mapper,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardType)
    private cardTypeRepository: Repository<CardType>,
  ) {}

  get(uuid: string) {
    return this.cardRepository.findOne({ where: { uuid } });
  }

  async update(cardUuid, card: Partial<CardUpdateDto>) {
    const existingCard = await this.cardRepository.findOne({
      where: { uuid: cardUuid },
    });

    const updatedCard = Object.assign(existingCard, card);

    return this.cardRepository.save(updatedCard);
  }

  async create(card: Partial<CardCreateDto>, board: Board) {
    const type = await this.cardTypeRepository.findOneOrFail({
      where: {
        code: card.typeCode,
      },
    });

    if (!type) {
      throw new ServiceValidationException(
        `Provided type does not exist ${card.typeCode}`,
      );
    }

    const newCard = new Card();
    newCard.statusUuid = board.statuses.reduce((prev, curr) =>
      prev.order < curr.order ? prev : curr,
    )?.status.uuid;
    newCard.typeUuid = type.uuid;
    newCard.boardUuid = board.uuid;

    return this.cardRepository.save(newCard);
  }

  async getByBoard(boardCode: string) {
    return this.cardRepository.find({
      where: { board: { code: boardCode } },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async mapToDto(cards: Card[]) {
    return this.mapper.mapArray(cards, Card, CardDto);
  }
}

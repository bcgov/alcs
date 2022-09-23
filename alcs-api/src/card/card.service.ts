import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardUpdateDto } from './card.dto';
import { Card } from './card.entity';

@Injectable()
export class CardService {
  private logger = new Logger(CardService.name);

  constructor(
    @InjectMapper() private mapper: Mapper,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
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
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardStatusDto } from './card-status.dto';
import { CardStatus } from './card-status.entity';

export const defaultApplicationStatus = {
  id: '46235264-9529-4e52-9c2d-6ed2b8b9edb8',
  code: 'TODO',
};

@Injectable()
export class CardStatusService {
  constructor(
    @InjectRepository(CardStatus)
    private cardStatusRepository: Repository<CardStatus>,
  ) {}

  async create(card: CardStatusDto): Promise<CardStatus> {
    const cardEntity = new CardStatus();
    cardEntity.code = card.code;
    cardEntity.description = card.description;

    return await this.cardStatusRepository.save(cardEntity);
  }
}

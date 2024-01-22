import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardService } from '../card.service';
import { CardStatusDto } from './card-status.dto';
import { CARD_STATUS, CardStatus } from './card-status.entity';

@Injectable()
export class CardStatusService {
  constructor(
    @InjectRepository(CardStatus)
    private cardStatusRepository: Repository<CardStatus>,
    private cardService: CardService,
  ) {}

  async fetch() {
    return await this.cardStatusRepository.find({
      order: { label: 'ASC' },
      select: {
        code: true,
        label: true,
        description: true,
      },
    });
  }

  async getOneOrFail(code: string) {
    return await this.cardStatusRepository.findOneOrFail({
      where: { code },
    });
  }

  async update(code: string, updateDto: CardStatusDto) {
    const cardStatus = await this.getOneOrFail(code);

    cardStatus.description = updateDto.description;
    cardStatus.label = updateDto.label;

    return await this.cardStatusRepository.save(cardStatus);
  }

  async create(createDto: CardStatusDto) {
    const cardStatus = new CardStatus();

    cardStatus.code = createDto.code;
    cardStatus.description = createDto.description;
    cardStatus.label = createDto.label;

    return await this.cardStatusRepository.save(cardStatus);
  }

  async getCardCountByStatus(code: CARD_STATUS) {
    const cards = await this.cardService.getByCardStatus(code);
    return cards.length;
  }

  async delete(code: string) {
    const cardStatus = await this.getOneOrFail(code);

    return await this.cardStatusRepository.remove(cardStatus);
  }
}

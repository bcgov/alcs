import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { Card } from '../../card/card.entity';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { CardSubtaskType } from './card-subtask-type/card-subtask-type.entity';
import { UpdateCardSubtaskDto } from './card-subtask.dto';
import { CardSubtask } from './card-subtask.entity';

@Injectable()
export class CardSubtaskService {
  private DEFAULT_RELATIONS: FindOptionsRelations<CardSubtask> = {
    assignee: true,
    type: true,
  };

  constructor(
    @InjectRepository(CardSubtask)
    private cardSubtaskRepository: Repository<CardSubtask>,
    @InjectRepository(CardSubtaskType)
    private cardSubtaskTypeRepository: Repository<CardSubtaskType>,
  ) {}

  async create(card: Card, typeCode: string) {
    const selectedType = await this.cardSubtaskTypeRepository.findOne({
      where: {
        code: typeCode,
      },
    });
    if (!selectedType) {
      throw new BadRequestException(`Invalid subtask type ${typeCode}`);
    }

    const subtask = new CardSubtask({
      card: card,
      type: selectedType,
    });

    const savedTask = await this.cardSubtaskRepository.save(subtask);

    return this.cardSubtaskRepository.findOne({
      where: {
        uuid: savedTask.uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async update(
    uuid: string,
    updates: Partial<UpdateCardSubtaskDto>,
  ): Promise<CardSubtask> {
    const existingTask = await this.cardSubtaskRepository.findOne({
      where: { uuid },
    });

    if (!existingTask) {
      throw new ServiceNotFoundException(`Failed to find task ${uuid}`);
    }

    if (updates.completedAt === null) {
      existingTask.completedAt = null;
    } else if (updates.completedAt) {
      existingTask.completedAt = new Date(updates.completedAt);
    }

    if (updates.assignee !== undefined) {
      existingTask.assigneeUuid = updates.assignee;
    }

    const savedTask = await this.cardSubtaskRepository.save(existingTask);

    return this.cardSubtaskRepository.findOne({
      where: {
        uuid: savedTask.uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async delete(uuid: string) {
    await this.cardSubtaskRepository.delete(uuid);
  }

  async getByCard(cardUuid: string) {
    return this.cardSubtaskRepository.find({
      where: { cardUuid },
      relations: this.DEFAULT_RELATIONS,
    });
  }
}

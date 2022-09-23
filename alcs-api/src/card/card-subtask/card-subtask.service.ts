import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { UpdateApplicationSubtaskDto } from '../../application/application-subtask/application-subtask.dto';
import { Card } from '../../card/card.entity';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { CardSubtaskType } from './card-subtask-type/card-subtask-type.entity';
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

  async create(card: Card, type: string) {
    const selectedType = await this.cardSubtaskTypeRepository.findOne({
      where: {
        type: type,
      },
    });
    if (!selectedType) {
      throw new BadRequestException(`Invalid subtask type ${type}`);
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
    updates: Partial<UpdateApplicationSubtaskDto>,
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
}

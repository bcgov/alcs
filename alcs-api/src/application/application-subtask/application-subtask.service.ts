import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { ServiceNotFoundException } from '../../common/exceptions/base.exception';
import { ApplicationService } from '../application.service';
import { ApplicationSubtaskType } from './application-subtask-type.entity';
import { UpdateApplicationSubtaskDto } from './application-subtask.dto';
import { CardSubtask } from './application-subtask.entity';

@Injectable()
export class ApplicationSubtaskService {
  private DEFAULT_RELATIONS: FindOptionsRelations<CardSubtask> = {
    assignee: true,
    type: true,
  };

  constructor(
    private applicationService: ApplicationService,
    @InjectRepository(CardSubtask)
    private applicationSubtaskRepository: Repository<CardSubtask>,
    @InjectRepository(ApplicationSubtaskType)
    private applicationSubtaskTypeRepository: Repository<ApplicationSubtaskType>,
  ) {}

  async create(fileNumber: string, type: string) {
    const application = await this.applicationService.get(fileNumber);
    if (!application) {
      throw new ServiceNotFoundException(`File number not found ${fileNumber}`);
    }

    const selectedType = await this.applicationSubtaskTypeRepository.findOne({
      where: {
        type: type,
      },
    });
    if (!selectedType) {
      throw new BadRequestException(`Invalid subtask type ${type}`);
    }

    const subtask = new CardSubtask({
      card: application.card,
      type: selectedType,
    });

    const savedTask = await this.applicationSubtaskRepository.save(subtask, {});

    return this.applicationSubtaskRepository.findOne({
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
    const existingTask = await this.applicationSubtaskRepository.findOne({
      where: { uuid },
    });

    if (!existingTask) {
      throw new ServiceNotFoundException(`Failed to find task ${uuid}`);
    }

    if (updates.completedAt === null) {
      existingTask.completedAt = null;
    }
    if (updates.completedAt) {
      existingTask.completedAt = new Date(updates.completedAt);
    }

    if (updates.assignee !== undefined) {
      existingTask.assigneeUuid = updates.assignee;
    }

    const savedTask = await this.applicationSubtaskRepository.save(
      existingTask,
    );

    return this.applicationSubtaskRepository.findOne({
      where: {
        uuid: savedTask.uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async delete(uuid: string) {
    await this.applicationSubtaskRepository.delete(uuid);
  }
}

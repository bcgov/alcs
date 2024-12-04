import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeOfIntentDecisionConditionDate } from './notice-of-intent-decision-condition-date.entity';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';
import { NoticeOfIntentDecisionCondition } from '../notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionDateDto } from './notice-of-intent-decision-condition-date.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class NoticeOfIntentDecisionConditionDateService {
  constructor(
    @InjectRepository(NoticeOfIntentDecisionConditionDate)
    private repository: Repository<NoticeOfIntentDecisionConditionDate>,
    @InjectRepository(NoticeOfIntentDecisionCondition)
    private conditionRepository: Repository<NoticeOfIntentDecisionCondition>,
  ) {}

  async fetchByCondition(conditionUuid: string): Promise<NoticeOfIntentDecisionConditionDateDto[]> {
    const condition = await this.conditionRepository.findOne({
      where: {
        uuid: conditionUuid,
      },
    });

    if (!condition) {
      throw new ServiceNotFoundException('Condition not found.');
    }

    const entities = await this.repository.find({
      where: {
        condition: {
          uuid: condition.uuid,
        },
      },
    });

    const dtos = plainToInstance(NoticeOfIntentDecisionConditionDateDto, entities);

    return dtos;
  }

  async create(
    conditionUuid: string,
    dto: NoticeOfIntentDecisionConditionDateDto,
  ): Promise<NoticeOfIntentDecisionConditionDateDto> {
    if (!dto.date) {
      throw new ServiceValidationException('Must supply date');
    }

    const condition = await this.conditionRepository.findOne({
      where: {
        uuid: conditionUuid,
      },
    });

    // Dates must be associated with a condition
    if (!condition) {
      throw new ServiceNotFoundException('No condition found.');
    }

    if (!dto.date) {
      throw new ServiceValidationException('Must specify date');
    }

    const entity = new NoticeOfIntentDecisionConditionDate({
      date: new Date(dto.date),
      condition: condition,
    });

    const createdEntity = await this.repository.save(entity);

    return plainToInstance(NoticeOfIntentDecisionConditionDateDto, createdEntity);
  }

  async update(
    uuid: string,
    dto: NoticeOfIntentDecisionConditionDateDto,
  ): Promise<NoticeOfIntentDecisionConditionDateDto> {
    const entity = await this.repository.findOneOrFail({
      where: { uuid },
    });

    if (!entity) {
      throw new ServiceNotFoundException('Date not found.');
    }

    if (dto.date) {
      entity.date = new Date(dto.date);
    }
    if (dto.completedDate) {
      entity.completedDate = new Date(dto.completedDate);
    } else if (dto.completedDate === null) {
      entity.completedDate = null;
    }
    if (dto.comment) {
      entity.comment = dto.comment;
    }

    const updatedEntity = await this.repository.save(entity);

    return plainToInstance(NoticeOfIntentDecisionConditionDateDto, updatedEntity);
  }

  async delete(uuid: string) {
    return await this.repository.delete(uuid);
  }
}

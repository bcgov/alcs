import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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

  async set(
    conditionUuid: string,
    dtos: NoticeOfIntentDecisionConditionDateDto[],
  ): Promise<NoticeOfIntentDecisionConditionDateDto[]> {
    const condition = await this.conditionRepository.findOne({
      where: { uuid: conditionUuid },
      relations: { dates: true },
    });

    if (!condition) {
      throw new ServiceValidationException('Dates must be associated with a condtion');
    }

    const dates = dtos.map((dto) => {
      const entity = new NoticeOfIntentDecisionConditionDate({ condition });

      if (!dto.uuid && !dto.date) {
        throw new ServiceValidationException('Must supply UUID of existing date or date.');
      }

      this.map(dto, entity);

      return entity;
    });

    condition.dates = dates;

    const updatedCondition = await condition.save();

    return plainToInstance(NoticeOfIntentDecisionConditionDateDto, updatedCondition.dates);
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

    this.map(dto, entity);

    const updatedEntity = await this.repository.save(entity);

    return plainToInstance(NoticeOfIntentDecisionConditionDateDto, updatedEntity);
  }

  async delete(uuid: string) {
    return await this.repository.delete(uuid);
  }

  map(dto: NoticeOfIntentDecisionConditionDateDto, entity: NoticeOfIntentDecisionConditionDate) {
    if (dto.date) {
      entity.date = new Date(dto.date);
    }
    if (dto.completedDate) {
      entity.completedDate = new Date(dto.completedDate);
    }
    if (dto.comment) {
      entity.comment = dto.comment;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeOfIntentDecisionConditionDate } from './notice-of-intent-decision-condition-date.entity';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';
import { NoticeOfIntentDecisionCondition } from '../notice-of-intent-decision-condition.entity';
import {
  CreateNoticeOfIntentDecisionConditionDateDto,
  NoticeOfIntentDecisionConditionDateDto,
} from './notice-of-intent-decision-condition-date.dto';
import { plainToInstance } from 'class-transformer';
import { DateType } from '../../../application-decision/application-decision-condition/application-decision-condition-code.entity';

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

  map(dto: NoticeOfIntentDecisionConditionDateDto, entity: NoticeOfIntentDecisionConditionDate) {
    if ('date' in dto) {
      entity.date = dto.date ? new Date(dto.date) : null;
    }
    if ('completedDate' in dto) {
      entity.completedDate = dto.completedDate ? new Date(dto.completedDate) : null;
    }
    if ('comment' in dto) {
      entity.comment = dto.comment ?? null;
    }
  }

  async create(createDto: CreateNoticeOfIntentDecisionConditionDateDto) {
    const condition = await this.conditionRepository.findOne({
      where: { uuid: createDto.conditionUuid },
      relations: ['type'],
    });

    if (!condition) {
      throw new ServiceNotFoundException(`Condition ${createDto.conditionUuid} was not found.`);
    }

    if (condition.type.dateType !== DateType.MULTIPLE) {
      throw new ServiceValidationException(
        `Creating a new date is not supported for condition ${createDto.conditionUuid}`,
      );
    }

    const newDate = new NoticeOfIntentDecisionConditionDate();
    newDate.date = null;
    newDate.completedDate = null;
    newDate.comment = null;
    newDate.condition = condition;

    return await this.repository.save(newDate);
  }

  async delete(dateUuid: string) {
    const conditionDate = await this.repository.findOne({
      where: { uuid: dateUuid },
      relations: ['condition', 'condition.type'],
    });

    if (!conditionDate) {
      throw new ServiceNotFoundException(`Condition Date ${dateUuid} was not found`);
    }

    if (conditionDate.condition.type.dateType !== DateType.MULTIPLE) {
      throw new ServiceValidationException(`Deleting the date ${dateUuid} is not permitted on single date type`);
    }

    return await this.repository.delete(dateUuid);
  }
}

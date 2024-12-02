import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeOfIntentDecisionConditionDate } from './notice-of-intent-decision-condition-date.entity';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';
import { NoticeOfIntentDecisionCondition } from '../notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionDateDto } from './notice-of-intent-decision-condition-date.dto';

@Injectable()
export class NoticeOfIntentDecisionConditionDateService {
  constructor(
    @InjectRepository(NoticeOfIntentDecisionConditionDate)
    private repository: Repository<NoticeOfIntentDecisionConditionDate>,
    @InjectRepository(NoticeOfIntentDecisionCondition)
    private conditionRepository: Repository<NoticeOfIntentDecisionCondition>,
  ) {}

  async fetchByCondition(conditionUuid: string): Promise<NoticeOfIntentDecisionConditionDate[]> {
    const condition = await this.conditionRepository.findOne({
      where: {
        uuid: conditionUuid,
      },
    });

    if (!condition) {
      throw new ServiceNotFoundException('Condition not found.');
    }

    const dates = await this.repository.find({
      where: {
        condition: {
          uuid: condition.uuid,
        },
      },
    });

    return dates;
  }

  async create(
    conditionUuid: string,
    dto: NoticeOfIntentDecisionConditionDateDto,
  ): Promise<NoticeOfIntentDecisionConditionDate> {
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

    const newDate = new NoticeOfIntentDecisionConditionDate({
      date: dto.date,
      condition: condition,
    });

    return this.repository.save(newDate);
  }

  async update(
    uuid: string,
    dto: NoticeOfIntentDecisionConditionDateDto,
  ): Promise<NoticeOfIntentDecisionConditionDate> {
    const date = await this.repository.findOneOrFail({
      where: { uuid },
    });

    if (!date) {
      throw new ServiceNotFoundException('Date not found.');
    }

    date.date = dto.date ?? date.date;
    date.completedDate = dto.completedDate ?? date.completedDate;
    date.comment = dto.comment ?? date.comment;

    return await this.repository.save(date);
  }

  async delete(uuid: string) {
    return await this.repository.delete(uuid);
  }
}

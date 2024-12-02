import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationDecisionConditionDate } from './application-decision-condition-date.entity';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';
import { ApplicationDecisionCondition } from '../application-decision-condition.entity';
import { ApplicationDecisionConditionDateDto } from './application-decision-condition-date.dto';

@Injectable()
export class ApplicationDecisionConditionDateService {
  constructor(
    @InjectRepository(ApplicationDecisionConditionDate)
    private repository: Repository<ApplicationDecisionConditionDate>,
    @InjectRepository(ApplicationDecisionCondition)
    private conditionRepository: Repository<ApplicationDecisionCondition>,
  ) {}

  async fetchByCondition(conditionUuid: string): Promise<ApplicationDecisionConditionDate[]> {
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
    dto: ApplicationDecisionConditionDateDto,
  ): Promise<ApplicationDecisionConditionDate> {
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

    const newDate = new ApplicationDecisionConditionDate({
      date: dto.date,
      condition: condition,
    });

    return this.repository.save(newDate);
  }

  async update(uuid: string, dto: ApplicationDecisionConditionDateDto): Promise<ApplicationDecisionConditionDate> {
    const date = await this.repository.findOneOrFail({
      where: { uuid },
    });

    if (!date) {
      throw new ServiceNotFoundException('Date not found.');
    }

    date.date = dto.date ?? date.date;
    date.completedDate = dto.completedDate === undefined ? date.completedDate : dto.completedDate;
    date.comment = dto.comment ?? date.comment;

    return await this.repository.save(date);
  }

  async delete(uuid: string) {
    return await this.repository.delete(uuid);
  }
}

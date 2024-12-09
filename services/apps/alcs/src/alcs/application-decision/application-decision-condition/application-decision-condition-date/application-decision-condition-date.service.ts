import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationDecisionConditionDate } from './application-decision-condition-date.entity';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';
import { ApplicationDecisionCondition } from '../application-decision-condition.entity';
import { ApplicationDecisionConditionDateDto } from './application-decision-condition-date.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ApplicationDecisionConditionDateService {
  constructor(
    @InjectRepository(ApplicationDecisionConditionDate)
    private repository: Repository<ApplicationDecisionConditionDate>,
    @InjectRepository(ApplicationDecisionCondition)
    private conditionRepository: Repository<ApplicationDecisionCondition>,
  ) {}

  async fetchByCondition(conditionUuid: string): Promise<ApplicationDecisionConditionDateDto[]> {
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

    const dtos = plainToInstance(ApplicationDecisionConditionDateDto, entities);

    return dtos;
  }

  async set(
    conditionUuid: string,
    dtos: ApplicationDecisionConditionDateDto[],
  ): Promise<ApplicationDecisionConditionDateDto[]> {
    const condition = await this.conditionRepository.findOne({
      where: { uuid: conditionUuid },
      relations: { dates: true },
    });

    if (!condition) {
      throw new ServiceValidationException('Dates must be associated with a condtion');
    }

    const dateEntities = dtos.map((dto) => {
      const entity = new ApplicationDecisionConditionDate();

      if (!dto.uuid && !dto.date) {
        throw new ServiceValidationException('Must supply UUID of existing date or date.');
      }

      if (dto.uuid) {
        entity.uuid = dto.uuid;
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

      return entity;
    });

    condition.dates = dateEntities;

    const updatedCondition = await condition.save();

    return plainToInstance(ApplicationDecisionConditionDateDto, updatedCondition.dates);
  }

  async delete(uuid: string) {
    return await this.repository.delete(uuid);
  }
}

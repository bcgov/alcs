import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
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

  async update(uuid: string, dto: ApplicationDecisionConditionDateDto): Promise<ApplicationDecisionConditionDateDto> {
    const entity = await this.repository.findOneOrFail({
      where: { uuid },
    });

    if (!entity) {
      throw new ServiceNotFoundException('Date not found.');
    }

    this.map(dto, entity);

    const updatedEntity = await this.repository.save(entity);

    return plainToInstance(ApplicationDecisionConditionDateDto, updatedEntity);
  }

  map(dto: ApplicationDecisionConditionDateDto, entity: ApplicationDecisionConditionDate) {
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

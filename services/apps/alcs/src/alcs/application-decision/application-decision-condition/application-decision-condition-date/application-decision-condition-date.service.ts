import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationDecisionConditionDate } from './application-decision-condition-date.entity';
import { ServiceNotFoundException, ServiceValidationException } from '@app/common/exceptions/base.exception';
import { ApplicationDecisionCondition } from '../application-decision-condition.entity';
import {
  ApplicationDecisionConditionDateDto,
  CreateApplicationDecisionConditionDateDto,
} from './application-decision-condition-date.dto';
import { plainToInstance } from 'class-transformer';
import { DateType } from '../application-decision-condition-code.entity';

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

  async create(createDto: CreateApplicationDecisionConditionDateDto) {
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

    const newDate = new ApplicationDecisionConditionDate();
    newDate.date = null;
    newDate.completedDate = null;
    newDate.comment = null;
    newDate.condition = condition;

    return await this.repository.save(newDate);
  }

  async delete(dateUuid: string, forceSingleDateDeletion: boolean = false) {
    const conditionDate = await this.repository.findOne({
      where: { uuid: dateUuid },
      relations: ['condition', 'condition.type'],
    });

    if (!conditionDate) {
      throw new ServiceNotFoundException(`Condition Date ${dateUuid} was not found`);
    }

    if (forceSingleDateDeletion) {
      return await this.repository.delete(dateUuid);
    }

    if (conditionDate.condition.type.dateType !== DateType.MULTIPLE) {
      throw new ServiceValidationException(`Deleting the date ${dateUuid} is not permitted on single date type`);
    }

    return await this.repository.delete(dateUuid);
  }
}

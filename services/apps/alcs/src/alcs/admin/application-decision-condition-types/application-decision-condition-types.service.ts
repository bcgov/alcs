import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApplicationDecisionConditionType,
  DateType,
} from '../../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionTypeDto } from '../../application-decision/application-decision-condition/application-decision-condition.dto';
import {
  ServiceNotFoundException,
  ServiceConflictException,
  BaseServiceException,
  ServiceValidationException,
} from '@app/common/exceptions/base.exception';

@Injectable()
export class ApplicationDecisionConditionTypesService {
  constructor(
    @InjectRepository(ApplicationDecisionConditionType)
    private applicationDecisionConditionTypeRepository: Repository<ApplicationDecisionConditionType>,
  ) {}

  async fetch(includeDeleted: boolean = false) {
    return await this.applicationDecisionConditionTypeRepository.find({
      order: { label: 'ASC' },
      select: {
        code: true,
        label: true,
        description: true,
        isActive: true,
        isComponentToConditionChecked: true,
        isDescriptionChecked: true,
        isAdministrativeFeeAmountChecked: true,
        isAdministrativeFeeAmountRequired: true,
        administrativeFeeAmount: true,
        isDateChecked: true,
        isDateRequired: true,
        dateType: true,
        singleDateLabel: true,
        isSecurityAmountChecked: true,
        isSecurityAmountRequired: true,
      },
    });
  }

  async fetchCodes() {
    return await this.applicationDecisionConditionTypeRepository.find({
      select: {
        code: true,
      },
      withDeleted: true,
    });
  }

  async getOneOrFail(code: string) {
    return await this.applicationDecisionConditionTypeRepository.findOneOrFail({
      where: { code },
    });
  }

  async update(code: string, updateDto: ApplicationDecisionConditionTypeDto) {
    const type = await this.getOneOrFail(code);

    type.description = updateDto.description;
    type.label = updateDto.label;
    type.isActive = updateDto.isActive;

    type.isAdministrativeFeeAmountChecked = updateDto.isAdministrativeFeeAmountChecked;
    type.isAdministrativeFeeAmountRequired = updateDto.isAdministrativeFeeAmountChecked
      ? updateDto.isAdministrativeFeeAmountRequired
      : null;

    type.administrativeFeeAmount =
      updateDto.isAdministrativeFeeAmountChecked && updateDto.administrativeFeeAmount
        ? updateDto.administrativeFeeAmount
        : null;

    type.isDateChecked = updateDto.isDateChecked;
    type.isDateRequired = updateDto.isDateChecked ? updateDto.isDateRequired : null;

    type.dateType = updateDto.isDateChecked ? updateDto.dateType : null;
    type.singleDateLabel = updateDto.dateType === DateType.SINGLE ? updateDto.singleDateLabel : null;

    type.isSecurityAmountChecked = updateDto.isSecurityAmountChecked;
    type.isSecurityAmountRequired = updateDto.isSecurityAmountChecked ? updateDto.isSecurityAmountRequired : null;

    return await this.applicationDecisionConditionTypeRepository.save(type);
  }

  async create(createDto: ApplicationDecisionConditionTypeDto) {
    if (await this.applicationDecisionConditionTypeRepository.exists({ where: { code: createDto.code } })) {
      throw new ServiceValidationException(`${createDto.code} code already in use or deleted.`);
    }

    const type = new ApplicationDecisionConditionType();

    type.code = createDto.code;
    type.description = createDto.description;
    type.label = createDto.label;
    type.isActive = createDto.isActive;
    type.isAdministrativeFeeAmountChecked = createDto.isAdministrativeFeeAmountChecked;
    type.isAdministrativeFeeAmountRequired = createDto.isAdministrativeFeeAmountChecked
      ? createDto.isAdministrativeFeeAmountRequired
      : null;

    type.administrativeFeeAmount =
      createDto.isAdministrativeFeeAmountChecked && createDto.administrativeFeeAmount
        ? createDto.administrativeFeeAmount
        : null;

    type.isDateChecked = createDto.isDateChecked;
    type.isDateRequired = createDto.isDateChecked ? createDto.isDateRequired : null;

    type.dateType = createDto.isDateChecked ? createDto.dateType : null;
    type.singleDateLabel = createDto.dateType === DateType.SINGLE ? createDto.singleDateLabel : null;

    type.isSecurityAmountChecked = createDto.isSecurityAmountChecked;
    type.isSecurityAmountRequired = createDto.isSecurityAmountChecked ? createDto.isSecurityAmountRequired : null;

    return await this.applicationDecisionConditionTypeRepository.save(type);
  }

  async delete(code: string) {
    const type = await this.applicationDecisionConditionTypeRepository.findOne({
      where: { code },
      relations: ['conditions', 'conditions.decision'],
    });

    if (!type) {
      throw new ServiceNotFoundException('Condition type not found');
    }

    const undeletedDecisions = type.conditions.map((condition) => condition.decision).filter((decision) => decision);

    if (undeletedDecisions.length > 0) {
      throw new ServiceConflictException('Condition is associated with a decision. Unable to delete.');
    }

    try {
      return await this.applicationDecisionConditionTypeRepository.softDelete(code);
    } catch (e) {
      throw new BaseServiceException('Unable to delete.');
    }
  }
}

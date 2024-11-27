import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionConditionType } from '../../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionTypeDto } from '../../application-decision/application-decision-condition/application-decision-condition.dto';
import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';

@Injectable()
export class ApplicationDecisionConditionTypesService {
  constructor(
    @InjectRepository(ApplicationDecisionConditionType)
    private applicationDecisionConditionTypeRepository: Repository<ApplicationDecisionConditionType>,
  ) {}

  async fetch() {
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
        isSingleDateChecked: true,
        isSingleDateRequired: true,
        singleDateLabel: true,
        isSecurityAmountChecked: true,
        isSecurityAmountRequired: true,
      },
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
    type.administrativeFeeAmount = updateDto.isAdministrativeFeeAmountChecked
      ? updateDto.administrativeFeeAmount
      : null;

    type.isSingleDateChecked = updateDto.isSingleDateChecked;
    type.isSingleDateRequired = updateDto.isSingleDateChecked ? updateDto.isSingleDateRequired : null;
    type.singleDateLabel = updateDto.isSingleDateChecked ? updateDto.singleDateLabel : null;

    type.isSecurityAmountChecked = updateDto.isSecurityAmountChecked;
    type.isSecurityAmountRequired = updateDto.isSecurityAmountChecked ? updateDto.isSecurityAmountRequired : null;

    return await this.applicationDecisionConditionTypeRepository.save(type);
  }

  async create(createDto: ApplicationDecisionConditionTypeDto) {
    const type = new ApplicationDecisionConditionType();

    type.code = createDto.code;
    type.description = createDto.description;
    type.label = createDto.label;
    type.isActive = createDto.isActive;
    type.isAdministrativeFeeAmountChecked = createDto.isAdministrativeFeeAmountChecked;
    type.isAdministrativeFeeAmountRequired = createDto.isAdministrativeFeeAmountChecked
      ? createDto.isAdministrativeFeeAmountRequired
      : null;
    type.administrativeFeeAmount = createDto.isAdministrativeFeeAmountChecked
      ? createDto.administrativeFeeAmount
      : null;

    type.isSingleDateChecked = createDto.isSingleDateChecked;
    type.isSingleDateRequired = createDto.isSingleDateChecked ? createDto.isSingleDateRequired : null;
    type.singleDateLabel = createDto.isSingleDateChecked ? createDto.singleDateLabel : null;

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
      throw new ServiceNotFoundException('Condition is associated with a decision. Unable to delete.');
    }

    try {
      return await this.applicationDecisionConditionTypeRepository.delete(code);
    } catch (e) {
      throw new ServiceNotFoundException('Unable to delete.');
    }
  }
}

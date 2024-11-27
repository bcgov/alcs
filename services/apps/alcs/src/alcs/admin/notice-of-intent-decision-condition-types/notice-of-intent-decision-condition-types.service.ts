import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentDecisionConditionType } from '../../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import { NoticeOfIntentDecisionConditionTypeDto } from '../../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition.dto';
import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';

@Injectable()
export class NoticeofIntentDecisionConditionTypesService {
  constructor(
    @InjectRepository(NoticeOfIntentDecisionConditionType)
    private noiDecisionConditionTypeRepository: Repository<NoticeOfIntentDecisionConditionType>,
  ) {}

  async fetch() {
    return await this.noiDecisionConditionTypeRepository.find({
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
    return await this.noiDecisionConditionTypeRepository.findOneOrFail({
      where: { code },
    });
  }

  async update(code: string, updateDto: NoticeOfIntentDecisionConditionTypeDto) {
    const decisionMakerCode = await this.getOneOrFail(code);

    decisionMakerCode.description = updateDto.description;
    decisionMakerCode.label = updateDto.label;
    decisionMakerCode.isActive = updateDto.isActive;

    decisionMakerCode.isAdministrativeFeeAmountChecked = updateDto.isAdministrativeFeeAmountChecked;
    decisionMakerCode.isAdministrativeFeeAmountRequired = updateDto.isAdministrativeFeeAmountChecked
      ? updateDto.isAdministrativeFeeAmountRequired
      : null;
    decisionMakerCode.administrativeFeeAmount = updateDto.isAdministrativeFeeAmountChecked
      ? updateDto.administrativeFeeAmount
      : null;

    decisionMakerCode.isSingleDateChecked = updateDto.isSingleDateChecked;
    decisionMakerCode.isSingleDateRequired = updateDto.isSingleDateChecked ? updateDto.isSingleDateRequired : null;
    decisionMakerCode.singleDateLabel = updateDto.isSingleDateChecked ? updateDto.singleDateLabel : null;

    decisionMakerCode.isSecurityAmountChecked = updateDto.isSecurityAmountChecked;
    decisionMakerCode.isSecurityAmountRequired = updateDto.isSecurityAmountChecked
      ? updateDto.isSecurityAmountRequired
      : null;

    return await this.noiDecisionConditionTypeRepository.save(decisionMakerCode);
  }

  async create(createDto: NoticeOfIntentDecisionConditionTypeDto) {
    const type = new NoticeOfIntentDecisionConditionType();

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

    return await this.noiDecisionConditionTypeRepository.save(type);
  }

  async delete(code: string) {
    const type = await this.noiDecisionConditionTypeRepository.findOne({
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
      return await this.noiDecisionConditionTypeRepository.delete(code);
    } catch (e) {
      throw new ServiceNotFoundException('Unable to delete.');
    }
  }
}

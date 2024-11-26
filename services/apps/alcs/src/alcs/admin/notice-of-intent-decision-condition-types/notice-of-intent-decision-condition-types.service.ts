import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentDecisionConditionType } from '../../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import { NoticeOfIntentDecisionConditionTypeDto } from '../../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition.dto';

@Injectable()
export class NoticeofIntentDecisionConditionTypesService {
  constructor(
    @InjectRepository(NoticeOfIntentDecisionConditionType)
    private noiDecisionMakerCodeRepository: Repository<NoticeOfIntentDecisionConditionType>,
  ) {}

  async fetch() {
    return await this.noiDecisionMakerCodeRepository.find({
      order: { label: 'ASC' },
      select: {
        code: true,
        label: true,
        description: true,
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
    return await this.noiDecisionMakerCodeRepository.findOneOrFail({
      where: { code },
    });
  }

  async update(code: string, updateDto: NoticeOfIntentDecisionConditionTypeDto) {
    const decisionMakerCode = await this.getOneOrFail(code);

    decisionMakerCode.description = updateDto.description;
    decisionMakerCode.label = updateDto.label;

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

    return await this.noiDecisionMakerCodeRepository.save(decisionMakerCode);
  }

  async create(createDto: NoticeOfIntentDecisionConditionTypeDto) {
    const decisionMakerCode = new NoticeOfIntentDecisionConditionType();

    decisionMakerCode.code = createDto.code;
    decisionMakerCode.description = createDto.description;
    decisionMakerCode.label = createDto.label;

    decisionMakerCode.isAdministrativeFeeAmountChecked = createDto.isAdministrativeFeeAmountChecked;
    decisionMakerCode.isAdministrativeFeeAmountRequired = createDto.isAdministrativeFeeAmountChecked
      ? createDto.isAdministrativeFeeAmountRequired
      : null;
    decisionMakerCode.administrativeFeeAmount = createDto.isAdministrativeFeeAmountChecked
      ? createDto.administrativeFeeAmount
      : null;

    decisionMakerCode.isSingleDateChecked = createDto.isSingleDateChecked;
    decisionMakerCode.isSingleDateRequired = createDto.isSingleDateChecked ? createDto.isSingleDateRequired : null;
    decisionMakerCode.singleDateLabel = createDto.isSingleDateChecked ? createDto.singleDateLabel : null;

    decisionMakerCode.isSecurityAmountChecked = createDto.isSecurityAmountChecked;
    decisionMakerCode.isSecurityAmountRequired = createDto.isSecurityAmountChecked
      ? createDto.isSecurityAmountRequired
      : null;

    return await this.noiDecisionMakerCodeRepository.save(decisionMakerCode);
  }
}

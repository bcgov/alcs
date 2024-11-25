import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentDecisionConditionType } from '../../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import { NoticeOfIntentDecisionConditionTypeDto } from '../../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition.dto';

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

    return await this.noiDecisionConditionTypeRepository.save(decisionMakerCode);
  }

  async create(createDto: NoticeOfIntentDecisionConditionTypeDto) {
    const type = new NoticeOfIntentDecisionConditionType();

    type.code = createDto.code;
    type.description = createDto.description;
    type.label = createDto.label;
    type.isActive = createDto.isActive;

    return await this.noiDecisionConditionTypeRepository.save(type);
  }

  async delete(code: string) {
    return await this.noiDecisionConditionTypeRepository.delete(code);
  }
}

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
        isActive: true,
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
    decisionMakerCode.isActive = updateDto.isActive;

    return await this.noiDecisionMakerCodeRepository.save(decisionMakerCode);
  }

  async create(createDto: NoticeOfIntentDecisionConditionTypeDto) {
    const decisionMakerCode = new NoticeOfIntentDecisionConditionType();

    decisionMakerCode.code = createDto.code;
    decisionMakerCode.description = createDto.description;
    decisionMakerCode.label = createDto.label;
    decisionMakerCode.isActive = createDto.isActive;

    return await this.noiDecisionMakerCodeRepository.save(decisionMakerCode);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionConditionType } from '../../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionConditionTypeDto } from '../../application-decision/application-decision-condition/application-decision-condition.dto';

@Injectable()
export class ApplicationDecisionConditionTypesService {
  constructor(
    @InjectRepository(ApplicationDecisionConditionType)
    private applicationDecisionMakerCodeRepository: Repository<ApplicationDecisionConditionType>,
  ) {}

  async fetch() {
    return await this.applicationDecisionMakerCodeRepository.find({
      order: { label: 'ASC' },
      select: {
        code: true,
        label: true,
        description: true,
      },
    });
  }

  async getOneOrFail(code: string) {
    return await this.applicationDecisionMakerCodeRepository.findOneOrFail({
      where: { code },
    });
  }

  async update(code: string, updateDto: ApplicationDecisionConditionTypeDto) {
    const decisionMakerCode = await this.getOneOrFail(code);

    decisionMakerCode.description = updateDto.description;
    decisionMakerCode.label = updateDto.label;

    return await this.applicationDecisionMakerCodeRepository.save(
      decisionMakerCode,
    );
  }

  async create(createDto: ApplicationDecisionConditionTypeDto) {
    const decisionMakerCode = new ApplicationDecisionConditionType();

    decisionMakerCode.code = createDto.code;
    decisionMakerCode.description = createDto.description;
    decisionMakerCode.label = createDto.label;

    return await this.applicationDecisionMakerCodeRepository.save(
      decisionMakerCode,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionMakerCode } from '../../application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionMakerCodeDto } from '../../application-decision/application-decision-maker/decision-maker.dto';

@Injectable()
export class ApplicationDecisionMakerService {
  constructor(
    @InjectRepository(ApplicationDecisionMakerCode)
    private applicationDecisionMakerCodeRepository: Repository<ApplicationDecisionMakerCode>,
  ) {}

  async fetch() {
    return await this.applicationDecisionMakerCodeRepository.find({
      order: { label: 'ASC' },
      select: {
        code: true,
        isActive: true,
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

  async update(code: string, updateDto: ApplicationDecisionMakerCodeDto) {
    const decisionMakerCode = await this.getOneOrFail(code);

    decisionMakerCode.description = updateDto.description;
    decisionMakerCode.label = updateDto.label;
    decisionMakerCode.isActive = updateDto.isActive;

    return await this.applicationDecisionMakerCodeRepository.save(
      decisionMakerCode,
    );
  }

  async create(createDto: ApplicationDecisionMakerCodeDto) {
    const decisionMakerCode = new ApplicationDecisionMakerCode();

    decisionMakerCode.code = createDto.code;
    decisionMakerCode.description = createDto.description;
    decisionMakerCode.label = createDto.label;
    decisionMakerCode.isActive = createDto.isActive;

    return await this.applicationDecisionMakerCodeRepository.save(
      decisionMakerCode,
    );
  }
}

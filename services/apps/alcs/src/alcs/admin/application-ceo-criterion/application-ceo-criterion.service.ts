import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationCeoCriterionCode } from '../../application-decision/application-ceo-criterion/application-ceo-criterion.entity';
import { CeoCriterionCodeDto } from '../../application-decision/application-decision-v1/application-decision/ceo-criterion/ceo-criterion.dto';

@Injectable()
export class ApplicationCeoCriterionService {
  constructor(
    @InjectRepository(ApplicationCeoCriterionCode)
    private ceoCriterionCodeRepository: Repository<ApplicationCeoCriterionCode>,
  ) {}

  async fetch() {
    return await this.ceoCriterionCodeRepository.find({
      order: { number: 'ASC' },
    });
  }

  async getOneOrFail(code: string) {
    return await this.ceoCriterionCodeRepository.findOneOrFail({
      where: { code },
    });
  }

  async update(code: string, updateDto: CeoCriterionCodeDto) {
    const ceoCriterion = await this.getOneOrFail(code);

    ceoCriterion.description = updateDto.description;
    ceoCriterion.label = updateDto.label;
    ceoCriterion.number = updateDto.number;

    return await this.ceoCriterionCodeRepository.save(ceoCriterion);
  }

  async create(createDto: CeoCriterionCodeDto) {
    const ceoCriterion = new ApplicationCeoCriterionCode();

    ceoCriterion.code = createDto.code;
    ceoCriterion.description = createDto.description;
    ceoCriterion.label = createDto.label;
    ceoCriterion.number = createDto.number;

    return await this.ceoCriterionCodeRepository.save(ceoCriterion);
  }
}

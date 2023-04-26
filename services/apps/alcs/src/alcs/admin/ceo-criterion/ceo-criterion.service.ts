import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CeoCriterionCode } from '../../decision/ceo-criterion/ceo-criterion.entity';
import { CeoCriterionCodeDto } from '../../decision/decision-v1/application-decision/ceo-criterion/ceo-criterion.dto';

@Injectable()
export class CeoCriterionService {
  constructor(
    @InjectRepository(CeoCriterionCode)
    private ceoCriterionCodeRepository: Repository<CeoCriterionCode>,
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
    const ceoCriterion = new CeoCriterionCode();

    ceoCriterion.code = createDto.code;
    ceoCriterion.description = createDto.description;
    ceoCriterion.label = createDto.label;
    ceoCriterion.number = createDto.number;

    return await this.ceoCriterionCodeRepository.save(ceoCriterion);
  }

  async delete(code: string) {
    const ceoCriterion = await this.getOneOrFail(code);

    return await this.ceoCriterionCodeRepository.remove(ceoCriterion);
  }
}

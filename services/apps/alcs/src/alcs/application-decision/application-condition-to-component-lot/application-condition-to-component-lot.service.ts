import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionConditionToComponentLot } from './application-decision-condition-to-component-lot.entity';

@Injectable()
export class ApplicationConditionToComponentLotService {
  constructor(
    @InjectRepository(ApplicationDecisionConditionToComponentLot)
    private conditionLotRepository: Repository<ApplicationDecisionConditionToComponentLot>,
  ) {}

  async createOrUpdate(
    componentLotUuid: string,
    conditionUuid: string,
    planNumbers: string | null,
  ) {
    let conditionLot = await this.conditionLotRepository.findOne({
      where: {
        componentLotUuid,
        conditionUuid,
      },
    });

    if (!conditionLot) {
      conditionLot = new ApplicationDecisionConditionToComponentLot({
        conditionUuid,
        componentLotUuid,
        planNumbers,
      });
    } else {
      conditionLot.planNumbers = planNumbers;
    }

    return await this.conditionLotRepository.save(conditionLot);
  }

  async fetch(componentUuid: string, conditionUuid: string) {
    return await this.conditionLotRepository.find({
      where: {
        conditionUuid,
        componentLot: {
          componentUuid,
        },
      },
    });
  }
}

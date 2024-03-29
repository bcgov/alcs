import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UpdateApplicationDecisionComponentLotDto } from './application-decision-component-lot.dto';
import { ApplicationDecisionComponentLot } from './application-decision-component-lot.entity';

@Injectable()
export class ApplicationDecisionComponentLotService {
  constructor(
    @InjectRepository(ApplicationDecisionComponentLot)
    private componentLotRepository: Repository<ApplicationDecisionComponentLot>,
  ) {}

  async update(
    uuid: string,
    updateDto: UpdateApplicationDecisionComponentLotDto,
  ) {
    const existingLot = await this.componentLotRepository.findOneByOrFail({
      uuid,
    });

    existingLot.alrArea = updateDto.alrArea;
    return await this.componentLotRepository.save(existingLot);
  }

  async softRemoveBy(componentUuid: string) {
    const componentLots = await this.componentLotRepository.findBy({
      componentUuid,
    });

    return await this.componentLotRepository.softRemove(componentLots);
  }

  async softRemove(uuids: string[]) {
    const componentLots = await this.componentLotRepository.findBy({
      uuid: In(uuids),
    });

    return await this.componentLotRepository.softRemove(componentLots);
  }
}

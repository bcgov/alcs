import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    console.log('before update', updateDto);
    const existingLot = await this.componentLotRepository.findOneByOrFail({
      uuid,
    });

    existingLot.alrArea = updateDto.alrArea;
    console.log('after update', existingLot);
    return await this.componentLotRepository.save(existingLot);
  }
}

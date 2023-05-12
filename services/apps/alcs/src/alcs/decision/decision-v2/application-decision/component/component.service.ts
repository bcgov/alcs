import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../../../libs/common/src/exceptions/base.exception';
import { CreateApplicationDecisionComponentDto } from './decision-component.dto';
import { ApplicationDecisionComponent } from './decision-component.entity';

@Injectable()
export class ComponentService {
  constructor(
    @InjectRepository(ApplicationDecisionComponent)
    private componentRepository: Repository<ApplicationDecisionComponent>,
  ) {}

  async getOneOrFail(uuid: string) {
    return this.componentRepository.findOneOrFail({
      where: { uuid },
    });
  }

  async createOrUpdate(
    updateDtos: CreateApplicationDecisionComponentDto[],
    isPersist = true,
  ) {
    const updatedComponents: ApplicationDecisionComponent[] = [];

    for (const updateDto of updateDtos) {
      let component: ApplicationDecisionComponent | null = null;

      if (updateDto.uuid) {
        component = await this.getOneOrFail(updateDto.uuid);
      } else {
        component = new ApplicationDecisionComponent();
        component.applicationDecisionComponentTypeCode =
          updateDto.applicationDecisionComponentTypeCode;
      }

      component.alrArea = updateDto.alrArea;
      component.agCap = updateDto.agCap;
      component.agCapSource = updateDto.agCapSource;
      component.agCapMap = updateDto.agCapMap;
      component.agCapConsultant = updateDto.agCapConsultant;

      //   parcel.purchasedDate = formatIncomingDate(updateDto.purchasedDate);

      updatedComponents.push(component);
    }

    if (isPersist) {
      return await this.componentRepository.save(updatedComponents);
    }

    return updatedComponents;
  }

  remove(components: ApplicationDecisionComponent[]) {
    return this.componentRepository.softRemove(components);
  }

  validate(components: CreateApplicationDecisionComponentDto[]) {
    if (!this.checkDuplicates(components)) {
      throw new ServiceValidationException(
        'Only on component of each type is allowed',
      );
    }
  }

  private checkDuplicates(components: CreateApplicationDecisionComponentDto[]) {
    const typeCounts = {};

    for (const { applicationDecisionComponentTypeCode } of components) {
      if (typeCounts[applicationDecisionComponentTypeCode]) {
        return false;
      }
      typeCounts[applicationDecisionComponentTypeCode] = 1;
    }

    return true;
  }

  softRemove(components: ApplicationDecisionComponent[]) {
    this.componentRepository.softRemove(components);
  }
}

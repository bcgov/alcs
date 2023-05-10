import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateApplicationDecisionConditionDto } from './decision-condition.dto';
import { ApplicationDecisionCondition } from './decision-condition.entity';

@Injectable()
export class DecisionConditionService {
  constructor(
    @InjectRepository(ApplicationDecisionCondition)
    private repository: Repository<ApplicationDecisionCondition>,
  ) {}

  async getOneOrFail(uuid: string) {
    return this.repository.findOneOrFail({
      where: { uuid },
    });
  }

  async createOrUpdate(
    updateDtos: UpdateApplicationDecisionConditionDto[],
    isPersist = true,
  ) {
    const updatedComponents: ApplicationDecisionCondition[] = [];

    for (const updateDto of updateDtos) {
      let component: ApplicationDecisionCondition | null = null;

      if (updateDto.uuid) {
        component = await this.getOneOrFail(updateDto.uuid);
      } else {
        component = new ApplicationDecisionCondition();
        component.typeCode = updateDto.type ?? null;
      }

      component.administrativeFee = updateDto.administrativeFee ?? null;
      component.description = updateDto.description ?? null;
      component.securityAmount = updateDto.securityAmount ?? null;
      component.approvalDependant = updateDto.approvalDependant ?? null;

      updatedComponents.push(component);
    }

    if (isPersist) {
      return await this.repository.save(updatedComponents);
    }

    return updatedComponents;
  }

  async remove(components: ApplicationDecisionCondition[]) {
    await this.repository.remove(components);
  }
}

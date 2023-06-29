import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';
import {
  UpdateApplicationDecisionConditionDto,
  UpdateApplicationDecisionConditionServiceDto,
} from './application-decision-condition.dto';
import { ApplicationDecisionCondition } from './application-decision-condition.entity';

@Injectable()
export class ApplicationDecisionConditionService {
  constructor(
    @InjectRepository(ApplicationDecisionCondition)
    private repository: Repository<ApplicationDecisionCondition>,
  ) {}

  async getOneOrFail(uuid: string) {
    return this.repository.findOneOrFail({
      where: { uuid },
      relations: {
        type: true,
      },
    });
  }

  async createOrUpdate(
    updateDtos: UpdateApplicationDecisionConditionDto[],
    allComponents: ApplicationDecisionComponent[],
    newComponents: ApplicationDecisionComponent[],
    isPersist = true,
  ) {
    const updatedConditions: ApplicationDecisionCondition[] = [];

    for (const updateDto of updateDtos) {
      let condition: ApplicationDecisionCondition | null = null;

      if (updateDto.uuid) {
        condition = await this.getOneOrFail(updateDto.uuid);
      } else {
        condition = new ApplicationDecisionCondition();
      }
      condition.typeCode = updateDto.type?.code ?? null;
      condition.administrativeFee = updateDto.administrativeFee ?? null;
      condition.description = updateDto.description ?? null;
      condition.securityAmount = updateDto.securityAmount ?? null;
      condition.approvalDependant = updateDto.approvalDependant ?? null;

      if (
        updateDto.componentDecisionUuid &&
        updateDto.componentToConditionType
      ) {
        const matchingComponent = allComponents.find(
          (component) =>
            component.applicationDecisionUuid ===
              updateDto.componentDecisionUuid &&
            component.applicationDecisionComponentType.code ===
              updateDto.componentToConditionType,
        );
        if (matchingComponent) {
          condition.componentUuid = matchingComponent.uuid;
          updatedConditions.push(condition);
          continue;
        }

        const matchingComponent2 = newComponents.find(
          (component) =>
            component.applicationDecisionComponentTypeCode ===
            updateDto.componentToConditionType,
        );
        if (matchingComponent2) {
          condition.component = matchingComponent2;
          updatedConditions.push(condition);
          continue;
        }

        throw new ServiceValidationException(
          'Failed to find matching component',
        );
      } else {
        condition.componentUuid = null;
        updatedConditions.push(condition);
      }
    }

    if (isPersist) {
      return await this.repository.save(updatedConditions);
    }

    return updatedConditions;
  }

  async remove(components: ApplicationDecisionCondition[]) {
    await this.repository.remove(components);
  }

  async update(
    existingCondition: ApplicationDecisionCondition,
    updates: UpdateApplicationDecisionConditionServiceDto,
  ) {
    await this.repository.update(existingCondition.uuid, updates);
    return await this.getOneOrFail(existingCondition.uuid);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
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
        updateDto.componentToConditions !== undefined &&
        updateDto.componentToConditions.length > 0
      ) {
        const matchingComponent = allComponents.filter(
          (component) =>
            updateDto.componentToConditions
              ?.flatMap((e) => e.componentDecisionUuid)
              .includes(component.applicationDecisionUuid) &&
            updateDto.componentToConditions
              ?.flatMap((e) => e.componentToConditionType)
              .includes(component.applicationDecisionComponentTypeCode),
        );

        if (matchingComponent && matchingComponent.length > 0) {
          condition.components = matchingComponent;
          updatedConditions.push(condition);
          continue;
        }

        const matchingComponent2 = newComponents.filter((component) =>
          updateDto.componentToConditions
            ?.flatMap((e) => e.componentToConditionType)
            .includes(component.applicationDecisionComponentTypeCode),
        );

        if (matchingComponent2 && matchingComponent2.length > 0) {
          condition.components = matchingComponent2;
          updatedConditions.push(condition);
          continue;
        }
        throw new ServiceValidationException(
          'Failed to find matching component',
        );
      } else {
        condition.components = null;
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { ApplicationDecisionConditionToComponentLot } from '../application-condition-to-component-lot/application-decision-condition-to-component-lot.entity';
import { ApplicationDecisionConditionComponentPlanNumber } from '../application-decision-component-to-condition/application-decision-component-to-condition-plan-number.entity';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecisionConditionType } from './application-decision-condition-code.entity';
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
    @InjectRepository(ApplicationDecisionConditionType)
    private typeRepository: Repository<ApplicationDecisionConditionType>,
    @InjectRepository(ApplicationDecisionConditionComponentPlanNumber)
    private conditionComponentRepository: Repository<ApplicationDecisionConditionComponentPlanNumber>,
    @InjectRepository(ApplicationDecisionConditionToComponentLot)
    private conditionComponentLotRepository: Repository<ApplicationDecisionConditionToComponentLot>,
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
      if (updateDto.type?.code) {
        condition.type = await this.typeRepository.findOneOrFail({
          where: {
            code: updateDto.type.code,
          },
        });
      }

      condition.administrativeFee = updateDto.administrativeFee ?? null;
      condition.description = updateDto.description ?? null;
      condition.securityAmount = updateDto.securityAmount ?? null;
      condition.approvalDependant = updateDto.approvalDependant ?? null;

      if (
        updateDto.componentsToCondition !== undefined &&
        updateDto.componentsToCondition.length > 0
      ) {
        const mappedComponents: ApplicationDecisionComponent[] = [];
        for (const componentToCondition of updateDto.componentsToCondition) {
          const matchingComponent = allComponents.find(
            (component) =>
              componentToCondition.componentDecisionUuid ===
                component.applicationDecisionUuid &&
              componentToCondition.componentToConditionType ===
                component.applicationDecisionComponentTypeCode,
          );

          if (matchingComponent) {
            mappedComponents.push(matchingComponent);
            updatedConditions.push(condition);
            continue;
          }

          const matchingComponent2 = newComponents.find(
            (component) =>
              componentToCondition.componentToConditionType ===
              component.applicationDecisionComponentTypeCode,
          );

          if (matchingComponent2) {
            mappedComponents.push(matchingComponent2);
            updatedConditions.push(condition);
            continue;
          }
          throw new ServiceValidationException(
            'Failed to find matching component',
          );
        }

        condition.components = mappedComponents;
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

  async remove(conditions: ApplicationDecisionCondition[]) {
    const lots = await this.conditionComponentLotRepository.find({
      where: {
        conditionUuid: In(conditions.map((e) => e.uuid)),
      },
    });

    await this.repository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.remove(lots);
        await transactionalEntityManager.remove(conditions);
      },
    );
  }

  async update(
    existingCondition: ApplicationDecisionCondition,
    updates: UpdateApplicationDecisionConditionServiceDto,
  ) {
    await this.repository.update(existingCondition.uuid, updates);
    return await this.getOneOrFail(existingCondition.uuid);
  }

  async getPlanNumbers(uuid: string) {
    return await this.conditionComponentRepository.findBy({
      applicationDecisionConditionUuid: uuid,
    });
  }

  async updateConditionPlanNumbers(
    conditionUuid: string,
    componentUuid: string,
    planNumbers: string | null,
  ) {
    let conditionToComponent =
      await this.conditionComponentRepository.findOneBy({
        applicationDecisionComponentUuid: componentUuid,
        applicationDecisionConditionUuid: conditionUuid,
      });

    if (conditionToComponent) {
      conditionToComponent.planNumbers = planNumbers;
    } else {
      conditionToComponent =
        new ApplicationDecisionConditionComponentPlanNumber({
          applicationDecisionComponentUuid: componentUuid,
          applicationDecisionConditionUuid: conditionUuid,
          planNumbers,
        });
    }

    await this.conditionComponentRepository.save(conditionToComponent);
  }
}

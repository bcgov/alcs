import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { ApplicationDecisionConditionComponent } from '../application-decision-component-to-condition/application-decision-component-to-condition.entity';
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
    @InjectRepository(ApplicationDecisionConditionComponent)
    private conditionComponentRepository: Repository<ApplicationDecisionConditionComponent>,
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
      let conditionComponents: ApplicationDecisionConditionComponent[] = [];

      if (updateDto.uuid) {
        condition = await this.getOneOrFail(updateDto.uuid);
        conditionComponents = await this.conditionComponentRepository.findBy({
          applicationDecisionConditionUuid: condition.uuid,
        });
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
        const mappedConditionComponents: ApplicationDecisionConditionComponent[] =
          [];
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

            let conditionComponent = conditionComponents?.find(
              (e) =>
                e.applicationDecisionComponentUuid === matchingComponent.uuid,
            );
            if (conditionComponent) {
              mappedConditionComponents.push(
                new ApplicationDecisionConditionComponent({
                  ...conditionComponent,
                }),
              );
            } else {
              conditionComponent = new ApplicationDecisionConditionComponent({
                applicationDecisionConditionUuid: condition.uuid,
                applicationDecisionComponentUuid: matchingComponent.uuid,
              });
              mappedConditionComponents.push(conditionComponent);
            }

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
            let conditionComponent = conditionComponents?.find(
              (e) =>
                e.applicationDecisionComponentUuid === matchingComponent2.uuid,
            );
            if (conditionComponent) {
              mappedConditionComponents.push(
                new ApplicationDecisionConditionComponent({
                  ...conditionComponent,
                }),
              );
            } else {
              conditionComponent = new ApplicationDecisionConditionComponent({
                applicationDecisionConditionUuid: condition.uuid,
                applicationDecisionComponentUuid: matchingComponent2.uuid,
              });
              mappedConditionComponents.push(conditionComponent);
            }
            continue;
          }
          throw new ServiceValidationException(
            'Failed to find matching component',
          );
        }

        const conditionComponentsToRemove = conditionComponents.filter(
          (e) =>
            !mappedConditionComponents.some(
              (c) =>
                c.applicationDecisionComponentUuid ===
                e.applicationDecisionComponentUuid,
            ),
        );
        condition.conditionToComponents = mappedConditionComponents;
        if (conditionComponentsToRemove) {
          await await this.conditionComponentRepository.remove(
            conditionComponents,
          );
        }
      } else {
        condition.conditionToComponents = null;
        await this.conditionComponentRepository.remove(conditionComponents);
        updatedConditions.push(condition);
      }
    }

    if (isPersist) {
      return await this.repository.save(updatedConditions);
    }

    return updatedConditions;
  }

  async remove(conditions: ApplicationDecisionCondition[]) {
    const conditionComponents = await this.conditionComponentRepository.find({
      where: {
        applicationDecisionConditionUuid: In(conditions.map((e) => e.uuid)),
      },
    });

    this.repository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.remove(conditionComponents);
      await transactionalEntityManager.remove(conditions);
    });
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
    const conditionToComponent =
      await this.conditionComponentRepository.findOneByOrFail({
        applicationDecisionComponentUuid: componentUuid,
        applicationDecisionConditionUuid: conditionUuid,
      });

    conditionToComponent.planNumbers = planNumbers;

    this.conditionComponentRepository.save(conditionToComponent);
  }
}

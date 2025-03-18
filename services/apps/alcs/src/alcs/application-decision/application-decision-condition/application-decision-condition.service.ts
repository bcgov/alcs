import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { ApplicationDecisionConditionToComponentLot } from '../application-condition-to-component-lot/application-decision-condition-to-component-lot.entity';
import { ApplicationDecisionConditionComponentPlanNumber } from '../application-decision-component-to-condition/application-decision-component-to-condition-plan-number.entity';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecisionConditionType } from './application-decision-condition-code.entity';
import {
  ApplicationDecisionConditionHomeDto,
  ApplicationDecisionHomeDto,
  ApplicationHomeDto,
  UpdateApplicationDecisionConditionDto,
  UpdateApplicationDecisionConditionServiceDto,
} from './application-decision-condition.dto';
import { ApplicationDecisionCondition } from './application-decision-condition.entity';
import { ApplicationDecisionConditionDate } from './application-decision-condition-date/application-decision-condition-date.entity';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { ApplicationTimeTrackingService } from '../../application/application-time-tracking.service';
import { ApplicationDecision } from '../application-decision.entity';
import { Application } from '../../application/application.entity';
import { ApplicationModification } from '../application-modification/application-modification.entity';
import { ApplicationReconsideration } from '../application-reconsideration/application-reconsideration.entity';

@Injectable()
export class ApplicationDecisionConditionService {
  private CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  private DEFAULT_APP_RELATIONS: FindOptionsRelations<ApplicationModification> = {
    application: {
      type: true,
      region: true,
      localGovernment: true,
      decisionMeetings: true,
    },
  };

  constructor(
    @InjectRepository(ApplicationDecisionCondition)
    private repository: Repository<ApplicationDecisionCondition>,
    @InjectRepository(ApplicationDecisionConditionType)
    private typeRepository: Repository<ApplicationDecisionConditionType>,
    @InjectRepository(ApplicationDecisionConditionComponentPlanNumber)
    private conditionComponentPlanNumbersRepository: Repository<ApplicationDecisionConditionComponentPlanNumber>,
    @InjectRepository(ApplicationDecisionConditionToComponentLot)
    private conditionComponentLotRepository: Repository<ApplicationDecisionConditionToComponentLot>,
    @InjectRepository(ApplicationModification)
    private modificationRepository: Repository<ApplicationModification>,
    @InjectRepository(ApplicationReconsideration)
    private reconsiderationRepository: Repository<ApplicationReconsideration>,
    @InjectMapper() private mapper: Mapper,
    private applicationTimeTrackingService: ApplicationTimeTrackingService,
  ) {}

  async getByTypeCode(typeCode: string): Promise<ApplicationDecisionCondition[]> {
    return this.repository.find({
      where: {
        type: {
          code: typeCode,
        },
      },
      relations: ['dates', 'decision'],
    });
  }

  async getOneOrFail(uuid: string) {
    return this.repository.findOneOrFail({
      where: { uuid },
      relations: {
        type: true,
        dates: true,
      },
    });
  }

  async findByUuids(uuids: string[]): Promise<ApplicationDecisionCondition[]> {
    return this.repository.find({
      where: {
        uuid: In(uuids),
      },
    });
  }

  getBy(findOptions: FindOptionsWhere<ApplicationDecisionCondition>) {
    return this.repository.find({
      where: findOptions,
      relations: {
        decision: {
          reconsiders: true,
          modifies: true,
          application: {
            decisionMeetings: true,
            type: true,
          },
        },
        conditionCard: {
          card: this.CARD_RELATIONS,
        },
      },
    });
  }

  async mapToDtos(conditions: ApplicationDecisionCondition[]): Promise<ApplicationDecisionConditionHomeDto[]> {
    const appTimeMap = await this.applicationTimeTrackingService.fetchActiveTimes(
      conditions.map((c) => c.decision.application),
    );
    const appPausedMap = await this.applicationTimeTrackingService.getPausedStatus(
      conditions.map((c) => c.decision.application),
    );
    const c = Promise.all(
      conditions.map(async (c) => {
        const condition = this.mapper.map(c, ApplicationDecisionCondition, ApplicationDecisionConditionHomeDto);
        const decision = this.mapper.map(c.decision, ApplicationDecision, ApplicationDecisionHomeDto);
        const application = this.mapper.map(c.decision.application, Application, ApplicationHomeDto);

        const appModifications = await this.modificationRepository.find({
          where: { application: { fileNumber: condition?.decision?.application.fileNumber } },
          relations: this.DEFAULT_APP_RELATIONS,
        });

        const appReconsiderations = await this.reconsiderationRepository.find({
          where: { application: { fileNumber: condition?.decision?.application.fileNumber } },
          relations: this.DEFAULT_APP_RELATIONS,
        });

        return {
          ...condition,
          isModification: appModifications.length > 0,
          isReconsideration: appReconsiderations.length > 0,
          decision: {
            ...decision,
            application: {
              ...application,
              activeDays: undefined,
              pausedDays: appTimeMap.get(application.uuid)!.pausedDays || 0,
              paused: appPausedMap.get(application.uuid) || false,
            },
          },
        };
      }),
    );
    return (await c).reduce((res: ApplicationDecisionConditionHomeDto[], curr: ApplicationDecisionConditionHomeDto) => {
      const existing = res.find((e) => e.conditionCard?.cardUuid === curr.conditionCard?.cardUuid);
      if (!existing) {
        res.push(curr);
      }
      return res;
    }, []);
  }

  async getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.repository.find({
      where: {
        conditionCard: {
          card: {
            subtasks: {
              completedAt: IsNull(),
              type: {
                code: subtaskType,
              },
            },
          },
        },
      },
      relations: {
        decision: {
          reconsiders: true,
          modifies: true,
          application: {
            decisionMeetings: true,
            type: true,
          },
        },
        conditionCard: {
          card: {
            board: true,
            type: true,
            status: true,
            assignee: true,
            subtasks: {
              card: true,
              type: true,
            },
          },
        },
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
      condition.order = updateDto.order ?? 0;
      if (updateDto.dates) {
        condition.dates = updateDto.dates.map((dateDto) => {
          const dateEntity = new ApplicationDecisionConditionDate();

          if (dateDto.date) {
            dateEntity.date = new Date(dateDto.date);
          }
          if (dateDto.completedDate) {
            dateEntity.completedDate = new Date(dateDto.completedDate);
          }
          if (dateDto.comment) {
            dateEntity.comment = dateDto.comment;
          }

          return dateEntity;
        });
      }

      if (updateDto.componentsToCondition !== undefined && updateDto.componentsToCondition.length > 0) {
        const mappedComponents: ApplicationDecisionComponent[] = [];
        for (const componentToCondition of updateDto.componentsToCondition) {
          const matchingComponent = allComponents.find(
            (component) =>
              componentToCondition.componentDecisionUuid === component.applicationDecisionUuid &&
              componentToCondition.componentToConditionType === component.applicationDecisionComponentTypeCode,
          );

          if (matchingComponent) {
            mappedComponents.push(matchingComponent);
            updatedConditions.push(condition);
            continue;
          }

          const matchingComponent2 = newComponents.find(
            (component) =>
              componentToCondition.componentToConditionType === component.applicationDecisionComponentTypeCode,
          );

          if (matchingComponent2) {
            mappedComponents.push(matchingComponent2);
            updatedConditions.push(condition);
            continue;
          }
          throw new ServiceValidationException('Failed to find matching component');
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

    await this.repository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.remove(lots);
      await transactionalEntityManager.remove(conditions);
    });
  }

  async update(existingCondition: ApplicationDecisionCondition, updates: UpdateApplicationDecisionConditionServiceDto) {
    await this.repository.update(existingCondition.uuid, updates);
    return await this.getOneOrFail(existingCondition.uuid);
  }

  async getPlanNumbers(uuid: string) {
    return await this.conditionComponentPlanNumbersRepository.findBy({
      applicationDecisionConditionUuid: uuid,
    });
  }

  async updateConditionPlanNumbers(conditionUuid: string, componentUuid: string, planNumbers: string | null) {
    let conditionToComponent = await this.conditionComponentPlanNumbersRepository.findOneBy({
      applicationDecisionComponentUuid: componentUuid,
      applicationDecisionConditionUuid: conditionUuid,
    });

    if (conditionToComponent) {
      conditionToComponent.planNumbers = planNumbers;
    } else {
      conditionToComponent = new ApplicationDecisionConditionComponentPlanNumber({
        applicationDecisionComponentUuid: componentUuid,
        applicationDecisionConditionUuid: conditionUuid,
        planNumbers,
      });
    }

    await this.conditionComponentPlanNumbersRepository.save(conditionToComponent);
  }

  async setSorting(data: { uuid: string; order: number }[]) {
    const uuids = data.map((data) => data.uuid);
    const conditions = await this.repository.find({
      where: {
        uuid: In(uuids),
      },
    });

    for (const condition of data) {
      const existingCondition = conditions.find((c) => c.uuid === condition.uuid);
      if (existingCondition) {
        existingCondition.order = condition.order;
      }
    }

    await this.repository.save(conditions);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { NoticeOfIntentDecisionComponent } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecisionConditionType } from './notice-of-intent-decision-condition-code.entity';
import {
  NoticeOfIntentDecisionConditionHomeDto,
  NoticeOfIntentDecisionHomeDto,
  NoticeOfIntentHomeDto,
  UpdateNoticeOfIntentDecisionConditionDto,
  UpdateNoticeOfIntentDecisionConditionServiceDto,
} from './notice-of-intent-decision-condition.dto';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionDate } from './notice-of-intent-decision-condition-date/notice-of-intent-decision-condition-date.entity';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { NoticeOfIntentDecision } from '../notice-of-intent-decision.entity';
import { NoticeOfIntent } from '../../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentModification } from '../notice-of-intent-modification/notice-of-intent-modification.entity';
import { ApplicationTimeData } from '../../application/application-time-tracking.service';

@Injectable()
export class NoticeOfIntentDecisionConditionService {
  CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  private DEFAULT_NOI_RELATIONS: FindOptionsRelations<NoticeOfIntentModification> = {
    noticeOfIntent: {
      type: true,
      region: true,
      localGovernment: true,
    },
  };

  constructor(
    @InjectRepository(NoticeOfIntentDecisionCondition)
    private repository: Repository<NoticeOfIntentDecisionCondition>,
    @InjectRepository(NoticeOfIntentDecisionConditionType)
    private typeRepository: Repository<NoticeOfIntentDecisionConditionType>,
    @InjectRepository(NoticeOfIntentModification)
    private modificationRepository: Repository<NoticeOfIntentModification>,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async getByTypeCode(typeCode: string): Promise<NoticeOfIntentDecisionCondition[]> {
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
      },
    });
  }

  async findByUuids(uuids: string[]): Promise<NoticeOfIntentDecisionCondition[]> {
    return this.repository.find({
      where: {
        uuid: In(uuids),
      },
    });
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
          modifies: true,
          noticeOfIntent: {
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

  getBy(findOptions: FindOptionsWhere<NoticeOfIntentDecisionCondition>) {
    return this.repository.find({
      where: findOptions,
      relations: {
        decision: {
          modifies: true,
          noticeOfIntent: {
            type: true,
          },
        },
        conditionCard: {
          card: this.CARD_RELATIONS,
        },
      },
    });
  }

  async mapToDtos(
    noticeOfIntents: NoticeOfIntentDecisionCondition[],
  ): Promise<NoticeOfIntentDecisionConditionHomeDto[]> {
    const uuids = noticeOfIntents.map((noi) => noi.decision.noticeOfIntent.uuid);
    const timeMap = await this.getTimes(uuids);
    const c = Promise.all(
      noticeOfIntents.map(async (c) => {
        const condition = this.mapper.map(c, NoticeOfIntentDecisionCondition, NoticeOfIntentDecisionConditionHomeDto);
        const decision = this.mapper.map(c.decision, NoticeOfIntentDecision, NoticeOfIntentDecisionHomeDto);
        const noticeOfIntent = this.mapper.map(c.decision.noticeOfIntent, NoticeOfIntent, NoticeOfIntentHomeDto);
        const appModifications = await this.modificationRepository.find({
          where: { noticeOfIntent: { fileNumber: condition?.decision?.noticeOfIntent.fileNumber } },
          relations: this.DEFAULT_NOI_RELATIONS,
        });

        return {
          ...condition,
          isModification: appModifications.length > 0,
          decision: {
            ...decision,
            noticeOfIntent: {
              ...noticeOfIntent,
              activeDays: undefined,
              pausedDays: timeMap.get(noticeOfIntent.uuid)!.pausedDays || 0,
              paused: timeMap.get(noticeOfIntent.uuid)?.pausedDays !== null,
            },
          },
        };
      }),
    );
    return (await c).reduce(
      (res: NoticeOfIntentDecisionConditionHomeDto[], curr: NoticeOfIntentDecisionConditionHomeDto) => {
        const existing = res.find((e) => e.conditionCard?.cardUuid === curr.conditionCard?.cardUuid);
        if (!existing) {
          res.push(curr);
        }
        return res;
      },
      [],
    );
  }

  async createOrUpdate(
    updateDtos: UpdateNoticeOfIntentDecisionConditionDto[],
    allComponents: NoticeOfIntentDecisionComponent[],
    newComponents: NoticeOfIntentDecisionComponent[],
    isPersist = true,
  ) {
    const updatedConditions: NoticeOfIntentDecisionCondition[] = [];

    for (const updateDto of updateDtos) {
      let condition: NoticeOfIntentDecisionCondition | null = null;

      if (updateDto.uuid) {
        condition = await this.getOneOrFail(updateDto.uuid);
      } else {
        condition = new NoticeOfIntentDecisionCondition();
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
      if (updateDto.dates) {
        condition.dates = updateDto.dates.map((dateDto) => {
          const dateEntity = new NoticeOfIntentDecisionConditionDate();

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
        const mappedComponents: NoticeOfIntentDecisionComponent[] = [];
        for (const componentToCondition of updateDto.componentsToCondition) {
          const matchingComponent = allComponents.find(
            (component) =>
              componentToCondition.componentDecisionUuid === component.noticeOfIntentDecisionUuid &&
              componentToCondition.componentToConditionType === component.noticeOfIntentDecisionComponentTypeCode,
          );

          if (matchingComponent) {
            mappedComponents.push(matchingComponent);
            updatedConditions.push(condition);
            continue;
          }

          const matchingComponent2 = newComponents.find(
            (component) =>
              componentToCondition.componentToConditionType === component.noticeOfIntentDecisionComponentTypeCode,
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

  async remove(conditions: NoticeOfIntentDecisionCondition[]) {
    await this.repository.remove(conditions);
  }

  async update(
    existingCondition: NoticeOfIntentDecisionCondition,
    updates: UpdateNoticeOfIntentDecisionConditionServiceDto,
  ) {
    await this.repository.update(existingCondition.uuid, updates);
    return await this.getOneOrFail(existingCondition.uuid);
  }

  async getTimes(uuids: string[]) {
    const activeCounts = (await this.repository.query(
      `
        SELECT * from alcs.calculate_noi_active_days($1)`,
      [`{${uuids.join(', ')}}`],
    )) as {
      noi_uuid: string;
      paused_days: number;
      active_days: number;
    }[];

    const results = new Map<string, ApplicationTimeData>();
    uuids.forEach((appUuid) => {
      results.set(appUuid, {
        pausedDays: null,
        activeDays: null,
      });
    });
    activeCounts.forEach((time) => {
      results.set(time.noi_uuid, {
        activeDays: time.active_days,
        pausedDays: time.paused_days,
      });
    });
    return results;
  }
}

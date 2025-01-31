import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { NoticeOfIntentDecisionComponent } from '../notice-of-intent-decision-component/notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecisionConditionType } from './notice-of-intent-decision-condition-code.entity';
import {
  UpdateNoticeOfIntentDecisionConditionDto,
  UpdateNoticeOfIntentDecisionConditionServiceDto,
} from './notice-of-intent-decision-condition.dto';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionDate } from './notice-of-intent-decision-condition-date/notice-of-intent-decision-condition-date.entity';

@Injectable()
export class NoticeOfIntentDecisionConditionService {
  constructor(
    @InjectRepository(NoticeOfIntentDecisionCondition)
    private repository: Repository<NoticeOfIntentDecisionCondition>,
    @InjectRepository(NoticeOfIntentDecisionConditionType)
    private typeRepository: Repository<NoticeOfIntentDecisionConditionType>,
    @InjectRepository(NoticeOfIntentDecisionConditionDate)
    private dateRepository: Repository<NoticeOfIntentDecisionConditionDate>,
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
    await this.repository.softRemove(conditions);
  }

  async update(
    existingCondition: NoticeOfIntentDecisionCondition,
    updates: UpdateNoticeOfIntentDecisionConditionServiceDto,
  ) {
    await this.repository.update(existingCondition.uuid, updates);
    return await this.getOneOrFail(existingCondition.uuid);
  }
}

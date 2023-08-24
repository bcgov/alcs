import { ServiceValidationException } from '@app/common/exceptions/base.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NOI_DECISION_COMPONENT_TYPE,
  CreateNoticeOfIntentDecisionComponentDto,
} from './notice-of-intent-decision-component.dto';
import { NoticeOfIntentDecisionComponent } from './notice-of-intent-decision-component.entity';

@Injectable()
export class NoticeOfIntentDecisionComponentService {
  constructor(
    @InjectRepository(NoticeOfIntentDecisionComponent)
    private componentRepository: Repository<NoticeOfIntentDecisionComponent>,
  ) {}

  async getOneOrFail(uuid: string) {
    return this.componentRepository.findOneOrFail({
      where: { uuid },
    });
  }

  async createOrUpdate(
    updateDtos: CreateNoticeOfIntentDecisionComponentDto[],
    isPersist = true,
  ) {
    const updatedComponents: NoticeOfIntentDecisionComponent[] = [];

    for (const updateDto of updateDtos) {
      let component: NoticeOfIntentDecisionComponent | null = null;

      if (updateDto.uuid) {
        component = await this.getOneOrFail(updateDto.uuid);
      } else {
        component = new NoticeOfIntentDecisionComponent();
        component.noticeOfIntentDecisionComponentTypeCode =
          updateDto.noticeOfIntentDecisionComponentTypeCode;
      }

      component.alrArea = updateDto.alrArea;
      component.agCap = updateDto.agCap;
      component.agCapSource = updateDto.agCapSource;
      component.agCapMap = updateDto.agCapMap;
      component.agCapConsultant = updateDto.agCapConsultant;

      this.patchPofoFields(component, updateDto);
      this.patchRosoFields(component, updateDto);

      updatedComponents.push(component);
    }

    if (isPersist) {
      return await this.componentRepository.save(updatedComponents);
    }

    return updatedComponents;
  }

  private patchPofoFields(
    component: NoticeOfIntentDecisionComponent,
    updateDto: CreateNoticeOfIntentDecisionComponentDto,
  ) {
    component.endDate = updateDto.endDate ? new Date(updateDto.endDate) : null;
    component.soilFillTypeToPlace = updateDto.soilFillTypeToPlace ?? null;
    component.soilToPlaceArea = updateDto.soilToPlaceArea ?? null;
    component.soilToPlaceVolume = updateDto.soilToPlaceVolume ?? null;
    component.soilToPlaceMaximumDepth =
      updateDto.soilToPlaceMaximumDepth ?? null;
    component.soilToPlaceAverageDepth =
      updateDto.soilToPlaceAverageDepth ?? null;
  }

  private patchRosoFields(
    component: NoticeOfIntentDecisionComponent,
    updateDto: CreateNoticeOfIntentDecisionComponentDto,
  ) {
    component.endDate = updateDto.endDate ? new Date(updateDto.endDate) : null;
    component.soilTypeRemoved = updateDto.soilTypeRemoved ?? null;
    component.soilToRemoveVolume = updateDto.soilToRemoveVolume ?? null;
    component.soilToRemoveArea = updateDto.soilToRemoveArea ?? null;
    component.soilToRemoveMaximumDepth =
      updateDto.soilToRemoveMaximumDepth ?? null;
    component.soilToRemoveAverageDepth =
      updateDto.soilToRemoveAverageDepth ?? null;
  }

  validate(
    componentsDto: CreateNoticeOfIntentDecisionComponentDto[],
    isDraftDecision = false,
  ) {
    if (!this.checkDuplicates(componentsDto)) {
      throw new ServiceValidationException(
        'Only on component of each type is allowed',
      );
    }

    if (!isDraftDecision) {
      if (componentsDto.length < 1) {
        throw new ServiceValidationException(
          'Decision components are required',
        );
      }

      this.validateDecisionComponentFields(componentsDto);
    }
  }

  private checkDuplicates(
    components: CreateNoticeOfIntentDecisionComponentDto[],
  ) {
    const typeCounts = {};

    for (const { noticeOfIntentDecisionComponentTypeCode } of components) {
      if (typeCounts[noticeOfIntentDecisionComponentTypeCode]) {
        return false;
      }
      typeCounts[noticeOfIntentDecisionComponentTypeCode] = 1;
    }

    return true;
  }

  async getAllByNoticeOfIntentUUID(noticeOfIntentUuid: string) {
    return await this.componentRepository.find({
      where: {
        noticeOfIntentDecision: {
          noticeOfIntentUuid,
        },
      },
      relations: {
        noticeOfIntentDecisionComponentType: true,
      },
    });
  }

  validateDecisionComponentFields(
    componentsDto: CreateNoticeOfIntentDecisionComponentDto[],
  ) {
    const errors: string[] = [];

    for (const component of componentsDto) {
      if (!component.alrArea) {
        errors.push('Alr Area is required');
      }
      if (!component.agCap) {
        errors.push('Agri Cap is required');
      }
      if (!component.alrArea) {
        errors.push('Agri Source is required');
      }

      if (
        component.noticeOfIntentDecisionComponentTypeCode ===
        NOI_DECISION_COMPONENT_TYPE.POFO
      ) {
        this.validatePofoDecisionComponentFields(component, errors);
      }

      if (
        component.noticeOfIntentDecisionComponentTypeCode ===
        NOI_DECISION_COMPONENT_TYPE.ROSO
      ) {
        this.validateRosoDecisionComponentFields(component, errors);
      }

      if (
        component.noticeOfIntentDecisionComponentTypeCode ===
        NOI_DECISION_COMPONENT_TYPE.PFRS
      ) {
        this.validatePofoDecisionComponentFields(component, errors);
        this.validateRosoDecisionComponentFields(component, errors);
      }
    }

    if (errors.length > 0) {
      throw new ServiceValidationException(errors.join(', '));
    }
  }

  private validatePofoDecisionComponentFields(
    component: CreateNoticeOfIntentDecisionComponentDto,
    errors: string[],
  ) {
    if (!component.soilFillTypeToPlace) {
      errors.push(
        'Type, origin and quality of fill approved to be placed is required',
      );
    }
    if (!component.soilToPlaceVolume) {
      errors.push('Volume To Place is required');
    }
    if (!component.soilToPlaceArea) {
      errors.push('Area To Place is required');
    }
    if (!component.soilToPlaceMaximumDepth) {
      errors.push('Maximum Depth To Place is required');
    }
    if (!component.soilToPlaceAverageDepth) {
      errors.push('Average Depth To Place is required');
    }
  }

  private validateRosoDecisionComponentFields(
    component: CreateNoticeOfIntentDecisionComponentDto,
    errors: string[],
  ) {
    if (!component.soilTypeRemoved) {
      errors.push('Type of soil approved to be removed is required');
    }
    if (!component.soilToRemoveVolume) {
      errors.push('Volume To Remove is required');
    }
    if (!component.soilToRemoveArea) {
      errors.push('Area To Remove is required');
    }
    if (!component.soilToRemoveMaximumDepth) {
      errors.push('Maximum Depth To Remove is required');
    }
    if (!component.soilToRemoveAverageDepth) {
      errors.push('Average Depth To Remove is required');
    }
  }

  async softRemove(components: NoticeOfIntentDecisionComponent[]) {
    await this.componentRepository.softRemove(components);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../../../libs/common/src/exceptions/base.exception';
import { ApplicationDecisionComponentLot } from '../../../application-component-lot/application-decision-component-lot.entity';
import { ApplicationDecisionComponentLotService } from '../../../application-component-lot/application-decision-component-lot.service';
import {
  APPLICATION_DECISION_COMPONENT_TYPE,
  CreateApplicationDecisionComponentDto,
} from './application-decision-component.dto';
import { ApplicationDecisionComponent } from './application-decision-component.entity';

@Injectable()
export class ApplicationDecisionComponentService {
  constructor(
    @InjectRepository(ApplicationDecisionComponent)
    private componentRepository: Repository<ApplicationDecisionComponent>,
    private componentLotService: ApplicationDecisionComponentLotService,
  ) {}

  async getOneOrFail(uuid: string) {
    return this.componentRepository.findOneOrFail({
      where: { uuid },
      relations: {
        lots: true,
      },
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

      this.patchNfuFields(component, updateDto);
      this.patchTurpFields(component, updateDto);
      this.patchPofoFields(component, updateDto);
      this.patchRosoFields(component, updateDto);
      this.patchNaruFields(component, updateDto);

      //SUBD
      this.updateComponentLots(component, updateDto);

      updatedComponents.push(component);
    }

    if (isPersist) {
      return await this.componentRepository.save(updatedComponents);
    }

    return updatedComponents;
  }

  private async updateComponentLots(
    component: ApplicationDecisionComponent,
    updateDto: CreateApplicationDecisionComponentDto,
  ) {
    if (updateDto.lots) {
      // component.subdApprovedLots = updateDto.subdApprovedLots;
      if (updateDto.uuid) {
        const lotsToRemove = component.lots
          .filter((l1) => !updateDto.lots?.some((l2) => l1.uuid === l2.uuid))
          .map((l) => l.uuid);

        component.lots = component.lots.filter(
          (l) => !lotsToRemove.includes(l.uuid),
        );

        updateDto.lots?.forEach((lot, index) => {
          if (lot.uuid) {
            const lotToUpdate = component.lots.find((e) => e.uuid === lot.uuid);
            if (lotToUpdate) {
              lotToUpdate.alrArea = lot.alrArea;
              lotToUpdate.type = lot.type;
              lotToUpdate.size = lot.size;
            }
          } else {
            component.lots.push(
              new ApplicationDecisionComponentLot({
                componentUuid: updateDto.uuid,
                alrArea: lot.alrArea,
                size: lot.size,
                type: lot.type,
                number: index + 1,
              }),
            );
          }
        });

        if (lotsToRemove.length > 0) {
          await this.componentLotService.softRemove(lotsToRemove);
        }
      } else {
        // this is a new component so it does not have lots and the lot is simply created
        component.lots = updateDto.lots.map(
          (e, index) =>
            new ApplicationDecisionComponentLot({
              componentUuid: updateDto.uuid,
              alrArea: e.alrArea,
              size: e.size,
              type: e.type,
              number: index + 1,
            }),
        );
      }
    }
  }

  private patchNfuFields(
    component: ApplicationDecisionComponent,
    updateDto: CreateApplicationDecisionComponentDto,
  ) {
    component.endDate = updateDto.endDate ? new Date(updateDto.endDate) : null;
    component.nfuSubType = updateDto.nfuSubType;
    component.nfuType = updateDto.nfuType;
  }

  private patchTurpFields(
    component: ApplicationDecisionComponent,
    updateDto: CreateApplicationDecisionComponentDto,
  ) {
    component.expiryDate = updateDto.expiryDate
      ? new Date(updateDto.expiryDate)
      : null;
  }

  private patchPofoFields(
    component: ApplicationDecisionComponent,
    updateDto: CreateApplicationDecisionComponentDto,
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
    component: ApplicationDecisionComponent,
    updateDto: CreateApplicationDecisionComponentDto,
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

  private patchNaruFields(
    component: ApplicationDecisionComponent,
    updateDto: CreateApplicationDecisionComponentDto,
  ) {
    component.endDate = updateDto.endDate ? new Date(updateDto.endDate) : null;
    component.expiryDate = updateDto.expiryDate
      ? new Date(updateDto.expiryDate)
      : null;
    component.naruSubtypeCode = updateDto.naruSubtypeCode;
  }

  validate(
    componentsDto: CreateApplicationDecisionComponentDto[],
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

  async softRemove(components: ApplicationDecisionComponent[]) {
    await this.componentRepository.softRemove(components);
    components.forEach(
      async (e) => await this.componentLotService.softRemoveBy(e.uuid),
    );
  }

  async getAllByApplicationUuid(applicationUuid: string) {
    return await this.componentRepository.find({
      where: {
        applicationDecision: {
          applicationUuid,
        },
      },
      relations: {
        applicationDecisionComponentType: true,
      },
    });
  }

  validateDecisionComponentFields(
    componentsDto: CreateApplicationDecisionComponentDto[],
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
        component.applicationDecisionComponentTypeCode ===
        APPLICATION_DECISION_COMPONENT_TYPE.NFUP
      ) {
        this.validateNfupDecisionComponentFields(component, errors);
      }

      if (
        component.applicationDecisionComponentTypeCode ===
        APPLICATION_DECISION_COMPONENT_TYPE.POFO
      ) {
        this.validatePofoDecisionComponentFields(component, errors);
      }

      if (
        component.applicationDecisionComponentTypeCode ===
        APPLICATION_DECISION_COMPONENT_TYPE.ROSO
      ) {
        this.validateRosoDecisionComponentFields(component, errors);
      }

      if (
        component.applicationDecisionComponentTypeCode ===
        APPLICATION_DECISION_COMPONENT_TYPE.PFRS
      ) {
        this.validatePofoDecisionComponentFields(component, errors);
        this.validateRosoDecisionComponentFields(component, errors);
      }

      if (
        component.applicationDecisionComponentTypeCode ===
        APPLICATION_DECISION_COMPONENT_TYPE.NARU
      ) {
        this.validateNaruDecisionComponentFields(component, errors);
      }
    }

    if (errors.length > 0) {
      throw new ServiceValidationException(errors.join(', '));
    }
  }

  private validateNfupDecisionComponentFields(
    component: CreateApplicationDecisionComponentDto,
    errors: string[],
  ) {
    if (!component.nfuSubType) {
      errors.push('Non-Farm Use Sub Type is required');
    }
    if (!component.nfuType) {
      errors.push('Non-Farm Use Type is required');
    }
  }

  private validatePofoDecisionComponentFields(
    component: CreateApplicationDecisionComponentDto,
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
    component: CreateApplicationDecisionComponentDto,
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

  private validateNaruDecisionComponentFields(
    component: CreateApplicationDecisionComponentDto,
    errors: string[],
  ) {
    if (!component.naruSubtypeCode) {
      errors.push('Residential Use Type is required');
    }
  }
}

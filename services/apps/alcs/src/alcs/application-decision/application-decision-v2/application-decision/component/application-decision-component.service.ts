import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceValidationException } from '../../../../../../../../libs/common/src/exceptions/base.exception';
import { CreateApplicationDecisionComponentDto } from './application-decision-component.dto';
import { ApplicationDecisionComponent } from './application-decision-component.entity';

@Injectable()
export class ApplicationDecisionComponentService {
  constructor(
    @InjectRepository(ApplicationDecisionComponent)
    private componentRepository: Repository<ApplicationDecisionComponent>,
  ) {}

  async getOneOrFail(uuid: string) {
    return this.componentRepository.findOneOrFail({
      where: { uuid },
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

      updatedComponents.push(component);
    }

    if (isPersist) {
      return await this.componentRepository.save(updatedComponents);
    }

    return updatedComponents;
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

  validate(componentsDto: CreateApplicationDecisionComponentDto[]) {
    if (!this.checkDuplicates(componentsDto)) {
      throw new ServiceValidationException(
        'Only on component of each type is allowed',
      );
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
}

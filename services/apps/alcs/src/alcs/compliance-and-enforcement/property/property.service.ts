import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { ServiceNotFoundException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { ComplianceAndEnforcementProperty } from './property.entity';
import { ComplianceAndEnforcementPropertyDto, UpdateComplianceAndEnforcementPropertyDto } from './property.dto';
import { ComplianceAndEnforcementDocument } from '../document/document.entity';

@Injectable()
export class ComplianceAndEnforcementPropertyService {
  constructor(
    @InjectRepository(ComplianceAndEnforcementProperty)
    private repository: Repository<ComplianceAndEnforcementProperty>,
    @InjectRepository(ComplianceAndEnforcementDocument)
    private documentRepository: Repository<ComplianceAndEnforcementDocument>,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async fetchParcels(fileNumber: string): Promise<ComplianceAndEnforcementPropertyDto[]> {
    const entity = await this.repository.find({
      where: {
        file: {
          fileNumber,
        },
      },
      relations: ['certificateOfTitle'],
    });

    if (entity === null) {
      throw new ServiceNotFoundException('A property for this C&E file does not exist.');
    }

    return this.mapper.mapArray(entity, ComplianceAndEnforcementProperty, ComplianceAndEnforcementPropertyDto);
  }

  async fetchByUuid(uuid: string): Promise<ComplianceAndEnforcementPropertyDto> {
    const entity = await this.repository.findOne({
      where: {
        uuid,
      },
      relations: ['certificateOfTitle'],
    });

    if (entity === null) {
      throw new ServiceNotFoundException('A property for this C&E file does not exist.');
    }

    return this.mapper.map(entity, ComplianceAndEnforcementProperty, ComplianceAndEnforcementPropertyDto);
  }

  async create(updateDto: UpdateComplianceAndEnforcementPropertyDto): Promise<ComplianceAndEnforcementPropertyDto> {
    const entity = this.mapper.map(
      updateDto,
      UpdateComplianceAndEnforcementPropertyDto,
      ComplianceAndEnforcementProperty,
    );

    const savedEntity = await this.repository.save(entity);

    return this.mapper.map(savedEntity, ComplianceAndEnforcementProperty, ComplianceAndEnforcementPropertyDto);
  }

  async update(
    uuid: string,
    updateDto: UpdateComplianceAndEnforcementPropertyDto,
  ): Promise<ComplianceAndEnforcementPropertyDto> {
    const entity = await this.repository.findOne({
      where: {
        uuid,
      },
    });

    if (!entity) {
      throw new ServiceNotFoundException('Property not found');
    }

    this.mapper.mutate(updateDto, entity, UpdateComplianceAndEnforcementPropertyDto, ComplianceAndEnforcementProperty);

    if (updateDto.certificateOfTitleUuid) {
      const certificateOfTitle = await this.documentRepository.findOne({
        where: {
          uuid: updateDto.certificateOfTitleUuid,
        },
      });

      entity.certificateOfTitle = certificateOfTitle ?? undefined;
    }

    const savedEntity = await this.repository.save(entity);

    return this.mapper.map(savedEntity, ComplianceAndEnforcementProperty, ComplianceAndEnforcementPropertyDto);
  }

  async delete(uuid: string): Promise<DeleteResult> {
    return await this.repository.delete({ uuid });
  }
}

import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplianceAndEnforcementSubmitter } from './submitter.entity';
import { ComplianceAndEnforcementSubmitterDto, UpdateComplianceAndEnforcementSubmitterDto } from './submitter.dto';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../libs/common/src/exceptions/base.exception';

@Injectable()
export class ComplianceAndEnforcementSubmitterService {
  constructor(
    @InjectRepository(ComplianceAndEnforcementSubmitter)
    private repository: Repository<ComplianceAndEnforcementSubmitter>,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async fetchAll(): Promise<ComplianceAndEnforcementSubmitterDto[]> {
    const entities = await this.repository.find({
      order: {
        dateAdded: 'DESC',
      },
    });
    return this.mapper.mapArray(entities, ComplianceAndEnforcementSubmitter, ComplianceAndEnforcementSubmitterDto);
  }

  async fetchByUuid(uuid: string): Promise<ComplianceAndEnforcementSubmitterDto> {
    const entity = await this.repository.findOne({
      where: {
        uuid: uuid,
      },
    });

    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this file number does not exist.');
    }

    return this.mapper.map(entity, ComplianceAndEnforcementSubmitter, ComplianceAndEnforcementSubmitterDto);
  }

  async fetchByFileNumber(fileNumber: string): Promise<ComplianceAndEnforcementSubmitterDto[]> {
    const entities = await this.repository.find({
      where: {
        file: {
          fileNumber: fileNumber,
        },
      },
      order: {
        dateAdded: 'DESC',
      },
    });

    if (entities === null) {
      throw new ServiceNotFoundException('A C&E file with this file number does not exist.');
    }

    return this.mapper.mapArray(entities, ComplianceAndEnforcementSubmitter, ComplianceAndEnforcementSubmitterDto);
  }

  async create(dto: UpdateComplianceAndEnforcementSubmitterDto): Promise<ComplianceAndEnforcementSubmitterDto> {
    const entity = this.mapper.map(dto, UpdateComplianceAndEnforcementSubmitterDto, ComplianceAndEnforcementSubmitter);
    const savedEntity = await this.repository.save(entity);

    return this.mapper.map(savedEntity, ComplianceAndEnforcementSubmitter, ComplianceAndEnforcementSubmitterDto);
  }

  async update(
    uuid: string,
    updateDto: UpdateComplianceAndEnforcementSubmitterDto,
  ): Promise<ComplianceAndEnforcementSubmitterDto> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceConflictException('A C&E file with this UUID does not exist. Unable to update.');
    }

    const updateEntity = this.mapper.map(
      updateDto,
      UpdateComplianceAndEnforcementSubmitterDto,
      ComplianceAndEnforcementSubmitter,
    );
    updateEntity.uuid = entity.uuid;
    updateEntity.file = entity.file;

    const savedEntity = await this.repository.save(updateEntity);

    return this.mapper.map(savedEntity, ComplianceAndEnforcementSubmitter, ComplianceAndEnforcementSubmitterDto);
  }

  async delete(uuid: string): Promise<DeleteResult> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this UUID does not exist. Unable to delete.');
    }

    return await this.repository.delete(uuid);
  }
}

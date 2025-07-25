import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AllegedActivity, ComplianceAndEnforcement, InitialSubmissionType } from './compliance-and-enforcement.entity';
import { ComplianceAndEnforcementDto, UpdateComplianceAndEnforcementDto } from './compliance-and-enforcement.dto';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../libs/common/src/exceptions/base.exception';
import { ComplianceAndEnforcementSubmitterService } from './submitter/submitter.service';

@Injectable()
export class ComplianceAndEnforcementService {
  constructor(
    @InjectRepository(ComplianceAndEnforcement)
    private repository: Repository<ComplianceAndEnforcement>,
    @InjectMapper() private mapper: Mapper,
    private readonly submitterService: ComplianceAndEnforcementSubmitterService,
  ) {}

  async fetchAll(): Promise<ComplianceAndEnforcementDto[]> {
    const entity = await this.repository.find({
      order: {
        fileNumber: 'DESC',
      },
    });
    return this.mapper.mapArray(entity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }

  async fetchByUuid(uuid: string, withSubmitters = false): Promise<ComplianceAndEnforcementDto> {
    const entity = await this.repository.findOne({
      where: {
        uuid,
      },
      relations: {
        submitters: withSubmitters,
      },
    });

    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this file number does not exist.');
    }

    return this.mapper.map(entity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }

  async fetchByFileNumber(fileNumber: string, withSubmitters = false): Promise<ComplianceAndEnforcementDto> {
    const entity = await this.repository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        submitters: withSubmitters,
      },
    });

    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this file number does not exist.');
    }

    return this.mapper.map(entity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }

  async create(
    dto: UpdateComplianceAndEnforcementDto,
    createInitialSubmitter = false,
  ): Promise<ComplianceAndEnforcementDto> {
    const entity = this.mapper.map(dto, UpdateComplianceAndEnforcementDto, ComplianceAndEnforcement);

    const savedEntity = await this.repository.save(entity);

    if (createInitialSubmitter) {
      await this.submitterService.create({ fileUuid: entity.uuid });
    }

    return this.mapper.map(savedEntity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }

  async update(uuid: string, updateDto: UpdateComplianceAndEnforcementDto): Promise<ComplianceAndEnforcementDto> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceConflictException('A C&E file with this UUID does not exist. Unable to update.');
    }

    const updateEntity = this.mapper.map(updateDto, UpdateComplianceAndEnforcementDto, ComplianceAndEnforcement);
    updateEntity.uuid = entity.uuid;
    updateEntity.fileNumber = entity.fileNumber;

    const savedEntity = await this.repository.save(updateEntity);

    return this.mapper.map(savedEntity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }

  async delete(uuid: string): Promise<DeleteResult> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this UUID does not exist. Unable to delete.');
    }

    return await this.repository.delete(uuid);
  }
}

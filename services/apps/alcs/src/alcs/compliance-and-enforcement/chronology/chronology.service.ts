import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplianceAndEnforcementChronologyEntry } from './chronology.entity';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from './chronology.dto';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../libs/common/src/exceptions/base.exception';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';

@Injectable()
export class ComplianceAndEnforcementChronologyService {
  constructor(
    @InjectRepository(ComplianceAndEnforcementChronologyEntry)
    private readonly repository: Repository<ComplianceAndEnforcementChronologyEntry>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectRepository(ComplianceAndEnforcement)
    private complianceAndEnforcementRepository: Repository<ComplianceAndEnforcement>,
  ) {}

  async entriesByFileId(
    fileId: string,
    options: { idType: string } = { idType: 'uuid' },
  ): Promise<ComplianceAndEnforcementChronologyEntryDto[]> {
    const entities = await this.repository.find({
      where: {
        file: {
          [options.idType]: fileId,
        },
      },
      relations: {
        file: true,
        documents: {
          document: true,
          type: true,
        },
      },
      order: {
        date: 'DESC',
      },
    });

    return this.mapper.mapArray(
      entities,
      ComplianceAndEnforcementChronologyEntry,
      ComplianceAndEnforcementChronologyEntryDto,
    );
  }

  async createEntry(
    dto: UpdateComplianceAndEnforcementChronologyEntryDto,
  ): Promise<ComplianceAndEnforcementChronologyEntryDto> {
    const entity = this.mapper.map(
      dto,
      UpdateComplianceAndEnforcementChronologyEntryDto,
      ComplianceAndEnforcementChronologyEntry,
    );

    const file = await this.complianceAndEnforcementRepository.findOne({
      where: {
        uuid: dto.fileUuid,
      },
    });
    if (file === null) {
      throw new ServiceNotFoundException(
        'A C&E file with this identifier does not exist. Unable to create chronology entry.',
      );
    }
    entity.file = file;

    const savedEntity = await this.repository.save(entity);

    return this.mapper.map(
      savedEntity,
      ComplianceAndEnforcementChronologyEntry,
      ComplianceAndEnforcementChronologyEntryDto,
    );
  }

  async updateEntry(
    uuid: string,
    updateDto: UpdateComplianceAndEnforcementChronologyEntryDto,
  ): Promise<ComplianceAndEnforcementChronologyEntryDto> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceConflictException('A C&E file with this UUID does not exist. Unable to update.');
    }

    const updateEntity = this.mapper.map(
      updateDto,
      UpdateComplianceAndEnforcementChronologyEntryDto,
      ComplianceAndEnforcementChronologyEntry,
    );
    updateEntity.uuid = entity.uuid;
    updateEntity.file = entity.file;

    const savedEntity = await this.repository.save(updateEntity);

    return this.mapper.map(
      savedEntity,
      ComplianceAndEnforcementChronologyEntry,
      ComplianceAndEnforcementChronologyEntryDto,
    );
  }

  async deleteEntry(uuid: string): Promise<DeleteResult> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this UUID does not exist. Unable to delete.');
    }

    return await this.repository.delete(uuid);
  }
}

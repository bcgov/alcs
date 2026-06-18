import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import { User } from '../../../../user/user.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { InspectionDto, UpdateInspectionDto } from './inspection.dto';
import { ComplianceAndEnforcementChronologyInspection } from './inspection.entity';

export interface InspectionOptions {
  filterByUuid?: string;
  filterByEntryUuid?: string;
}

@Injectable()
export class ComplianceAndEnforcementChronologyInspectionService {
  constructor(
    @InjectRepository(ComplianceAndEnforcementChronologyInspection)
    private repository: Repository<ComplianceAndEnforcementChronologyInspection>,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async getAll(options: InspectionOptions = {}): Promise<InspectionDto[]> {
    const where: FindOptionsWhere<ComplianceAndEnforcementChronologyInspection> = {};

    if (options.filterByUuid) {
      where.uuid = options.filterByUuid;
    }

    if (options.filterByEntryUuid) {
      where.entry = {
        uuid: options.filterByEntryUuid,
      };
    }

    const entity = await this.repository.find({
      where,
      relations: {
        officer: true,
        documents: {
          document: true,
          type: true,
          chronologyEntry: true,
        },
        entry: true,
      },
      order: { createdAt: 'ASC' },
    });

    return this.mapper.mapArray(entity, ComplianceAndEnforcementChronologyInspection, InspectionDto);
  }

  async createDraft(updateDto: UpdateInspectionDto): Promise<string> {
    const draftInspection = this.repository.create();

    if (updateDto.officerUuid) {
      draftInspection.officer = new User({ uuid: updateDto.officerUuid });
    }

    if (updateDto.entryUuid) {
      draftInspection.entry = new ComplianceAndEnforcementChronologyEntry({ uuid: updateDto.entryUuid });
    }

    const savedDraftInspection = await this.repository.save(draftInspection);

    return savedDraftInspection.uuid;
  }

  async update(uuid: string, updateDto: UpdateInspectionDto): Promise<InspectionDto> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceConflictException('An inspection with this UUID does not exist. Unable to update.');
    }

    const updateEntity = this.mapper.map(updateDto, UpdateInspectionDto, ComplianceAndEnforcementChronologyInspection);
    updateEntity.uuid = entity.uuid;

    const savedEntity = await this.repository.save(updateEntity);

    return this.mapper.map(savedEntity, ComplianceAndEnforcementChronologyInspection, InspectionDto);
  }

  async delete(uuid: string): Promise<DeleteResult> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this UUID does not exist. Unable to delete.');
    }

    return await this.repository.delete(uuid);
  }
}

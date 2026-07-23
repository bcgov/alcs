import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { DeleteResult, FindOptionsWhere, Repository } from 'typeorm';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../libs/common/src/exceptions/base.exception';
import { UserService } from '../../../user/user.service';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from './chronology.dto';
import { ComplianceAndEnforcementChronologyEntry } from './chronology.entity';

export interface EntryOptions {
  filterByUuid?: string;
  filterByFileUuid?: string;
  filterByFileNumber?: string;
}

@Injectable()
export class ComplianceAndEnforcementChronologyService {
  constructor(
    @InjectRepository(ComplianceAndEnforcementChronologyEntry)
    private readonly repository: Repository<ComplianceAndEnforcementChronologyEntry>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectRepository(ComplianceAndEnforcement)
    private complianceAndEnforcementRepository: Repository<ComplianceAndEnforcement>,
    private readonly userService: UserService,
  ) {}

  async entries(options: EntryOptions): Promise<ComplianceAndEnforcementChronologyEntryDto[]> {
    const where: FindOptionsWhere<ComplianceAndEnforcementChronologyEntry> = {};

    if (options.filterByUuid) {
      where.uuid = options.filterByUuid;
    }

    if (options.filterByFileUuid) {
      where.file = {
        uuid: options.filterByFileUuid,
      };
    }

    if (options.filterByFileNumber) {
      where.file = {
        fileNumber: options.filterByFileNumber,
      };
    }

    const entities = await this.repository.find({
      where,
      relations: {
        file: true,
        author: true,
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

  async entry(uuid: string, options: EntryOptions = {}) {
    const entity = await this.repository.findOne({
      where: { uuid },
      relations: {
        file: true,
        author: true,
        documents: {
          document: true,
          type: true,
        },
      },
      order: {
        date: 'DESC',
      },
    });

    return this.mapper.map(entity, ComplianceAndEnforcementChronologyEntry, ComplianceAndEnforcementChronologyEntryDto);
  }

  async createEntry(
    dto: UpdateComplianceAndEnforcementChronologyEntryDto,
  ): Promise<ComplianceAndEnforcementChronologyEntryDto> {
    const entity = this.mapper.map(
      dto,
      UpdateComplianceAndEnforcementChronologyEntryDto,
      ComplianceAndEnforcementChronologyEntry,
    );

    if (dto.authorUuid !== undefined) {
      const author = await this.userService.getByUuid(dto.authorUuid);

      if (author === null) {
        throw new ServiceNotFoundException('A user with this UUID does not exist. Unable to create chronology entry.');
      }

      entity.author = author;
    }

    if (dto.fileUuid !== undefined) {
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
    }

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

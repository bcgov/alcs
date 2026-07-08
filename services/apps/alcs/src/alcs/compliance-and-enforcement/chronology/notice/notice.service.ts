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
import { ComplianceAndEnforcementResponsibleParty } from '../../responsible-parties/responsible-party.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { NoticeDto, UpdateNoticeDto } from './notice.dto';
import { ComplianceAndEnforcementNotice } from './notice.entity';

export interface NoticeOptions {
  filterByUuid?: string;
  filterByEntryUuid?: string;
}

export interface IssueeOptions {
  filterByFileNumber?: string;
}

@Injectable()
export class ComplianceAndEnforcementNoticeService {
  constructor(
    @InjectRepository(ComplianceAndEnforcementNotice)
    private repository: Repository<ComplianceAndEnforcementNotice>,
    @InjectRepository(ComplianceAndEnforcementResponsibleParty)
    private responsiblePartyRepository: Repository<ComplianceAndEnforcementResponsibleParty>,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async getAll(options: NoticeOptions = {}): Promise<NoticeDto[]> {
    const where: FindOptionsWhere<ComplianceAndEnforcementNotice> = {};

    if (options.filterByUuid) {
      where.uuid = options.filterByUuid;
    }

    if (options.filterByEntryUuid) {
      where.entry = {
        uuid: options.filterByEntryUuid,
      };
    }

    const entities = await this.repository.find({
      where,
      relations: {
        documents: {
          document: true,
          type: true,
          chronologyEntry: true,
        },
        issuedToIndividualResponsibleParty: true,
        issuedToDirector: true,
        dueDates: true,
        entry: true,
      },
      order: { createdAt: 'ASC' },
    });

    return this.mapper.mapArray(entities, ComplianceAndEnforcementNotice, NoticeDto);
  }

  async createDraft(updateDto: UpdateNoticeDto): Promise<string> {
    const draftNotice = this.repository.create();

    if (updateDto.entryUuid) {
      draftNotice.entry = new ComplianceAndEnforcementChronologyEntry({ uuid: updateDto.entryUuid });
    }

    const savedDraftNotice = await this.repository.save(draftNotice);

    return savedDraftNotice.uuid;
  }

  async update(uuid: string, updateDto: UpdateNoticeDto): Promise<NoticeDto> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceConflictException('An notice with this UUID does not exist. Unable to update.');
    }

    const updateEntity = this.mapper.map(updateDto, UpdateNoticeDto, ComplianceAndEnforcementNotice);
    updateEntity.uuid = entity.uuid;

    if (updateDto.issuedToIndividualResponsiblePartyUuid) {
      const responsiblePartyEntity = await this.responsiblePartyRepository.findOneBy({
        uuid: updateDto.issuedToIndividualResponsiblePartyUuid,
      });

      if (!responsiblePartyEntity) {
        throw new ServiceNotFoundException("Can't find responsible party");
      }

      updateEntity.issuedToIndividualResponsibleParty = responsiblePartyEntity;
    } else if (updateDto.issuedToIndividualResponsiblePartyUuid === null) {
      updateEntity.issuedToIndividualResponsibleParty = null;
    }

    if (updateDto.issuedToDirectorUuid) {
      const responsiblePartyEntity = await this.responsiblePartyRepository.findOne({
        where: {
          directors: {
            uuid: updateDto.issuedToDirectorUuid,
          },
        },
        relations: {
          directors: true,
        },
      });

      if (!responsiblePartyEntity?.directors?.[0]) {
        throw new ServiceNotFoundException("Can't find responsible party");
      }

      updateEntity.issuedToDirector = responsiblePartyEntity.directors[0];
    } else if (updateDto.issuedToDirectorUuid === null) {
      updateEntity.issuedToDirector = null;
    }

    const savedEntity = await this.repository.save(updateEntity);

    return this.mapper.map(savedEntity, ComplianceAndEnforcementNotice, NoticeDto);
  }

  async delete(uuid: string): Promise<DeleteResult> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this UUID does not exist. Unable to delete.');
    }

    return await this.repository.delete(uuid);
  }
}

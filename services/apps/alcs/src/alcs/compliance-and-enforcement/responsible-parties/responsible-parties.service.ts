import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { v4 as uuidv4 } from 'uuid';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../libs/common/src/exceptions/base.exception';
import { ComplianceAndEnforcementResponsibleParty, ComplianceAndEnforcementResponsiblePartyDirector } from './entities';
import {
  ComplianceAndEnforcementResponsiblePartyDto,
  CreateComplianceAndEnforcementResponsiblePartyDto,
  UpdateComplianceAndEnforcementResponsiblePartyDto,
} from './responsible-parties.dto';
import { ComplianceAndEnforcementDocument } from '../document/document.entity';

@Injectable()
export class ComplianceAndEnforcementResponsiblePartyService {
  constructor(
    @InjectRepository(ComplianceAndEnforcementResponsibleParty)
    private repository: Repository<ComplianceAndEnforcementResponsibleParty>,
    @InjectRepository(ComplianceAndEnforcementResponsiblePartyDirector)
    private directorRepository: Repository<ComplianceAndEnforcementResponsiblePartyDirector>,
    @InjectRepository(ComplianceAndEnforcementDocument)
    private documentRepository: Repository<ComplianceAndEnforcementDocument>,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async fetchByFileUuid(fileUuid: string): Promise<ComplianceAndEnforcementResponsiblePartyDto[]> {
    const entities = await this.repository.find({
      where: {
        fileUuid,
      },
      relations: ['directors'],
      order: {
        partyType: 'ASC',
      },
    });

    return this.mapper.mapArray(
      entities,
      ComplianceAndEnforcementResponsibleParty,
      ComplianceAndEnforcementResponsiblePartyDto,
    );
  }

  async fetchByFileNumber(fileNumber: string): Promise<ComplianceAndEnforcementResponsiblePartyDto[]> {
    const entities = await this.repository.find({
      where: {
        file: {
          fileNumber,
        },
      },
      relations: ['directors', 'file', 'corporateSummary'],
      order: {
        partyType: 'ASC',
      },
    });

    return this.mapper.mapArray(
      entities,
      ComplianceAndEnforcementResponsibleParty,
      ComplianceAndEnforcementResponsiblePartyDto,
    );
  }

  async fetchByUuid(uuid: string): Promise<ComplianceAndEnforcementResponsiblePartyDto> {
    const entity = await this.repository.findOne({
      where: {
        uuid,
      },
      relations: ['directors'],
    });

    if (!entity) {
      throw new ServiceNotFoundException('Responsible party not found');
    }

    return this.mapper.map(
      entity,
      ComplianceAndEnforcementResponsibleParty,
      ComplianceAndEnforcementResponsiblePartyDto,
    );
  }

  async create(
    dto: CreateComplianceAndEnforcementResponsiblePartyDto,
  ): Promise<ComplianceAndEnforcementResponsiblePartyDto> {
    const entity = this.mapper.map(
      dto,
      CreateComplianceAndEnforcementResponsiblePartyDto,
      ComplianceAndEnforcementResponsibleParty,
    );

    // Generate UUID for the main entity
    entity.uuid = uuidv4();

    // Handle directors separately if they exist
    if (dto.directors && dto.directors.length > 0) {
      entity.directors = dto.directors.map((directorDto) => {
        const director = new ComplianceAndEnforcementResponsiblePartyDirector();
        director.uuid = uuidv4(); // Generate UUID for director
        director.directorName = directorDto.directorName;
        director.directorMailingAddress = directorDto.directorMailingAddress;
        director.directorTelephone = directorDto.directorTelephone;
        director.directorEmail = directorDto.directorEmail;
        director.responsibleParty = entity;
        return director;
      });
    }

    const savedEntity = await this.repository.save(entity);

    return this.mapper.map(
      savedEntity,
      ComplianceAndEnforcementResponsibleParty,
      ComplianceAndEnforcementResponsiblePartyDto,
    );
  }

  async update(
    uuid: string,
    updateDto: UpdateComplianceAndEnforcementResponsiblePartyDto,
  ): Promise<ComplianceAndEnforcementResponsiblePartyDto> {
    const entity = await this.repository.findOne({
      where: { uuid },
      relations: ['directors'],
    });

    if (!entity) {
      throw new ServiceConflictException('Responsible party not found. Unable to update.');
    }

    // Update basic fields
    this.mapper.mutate(
      updateDto,
      entity,
      UpdateComplianceAndEnforcementResponsiblePartyDto,
      ComplianceAndEnforcementResponsibleParty,
    );

    // Handle directors update
    if (updateDto.directors !== undefined) {
      // Remove existing directors
      if (entity.directors && entity.directors.length > 0) {
        await this.directorRepository.remove(entity.directors);
      }

      // Add new directors
      if (updateDto.directors && updateDto.directors.length > 0) {
        entity.directors = updateDto.directors.map((directorDto) => {
          const director = new ComplianceAndEnforcementResponsiblePartyDirector();
          director.uuid = uuidv4(); // Generate UUID for new director
          director.directorName = directorDto.directorName || '';
          director.directorMailingAddress = directorDto.directorMailingAddress || '';
          director.directorTelephone = directorDto.directorTelephone;
          director.directorEmail = directorDto.directorEmail;
          director.responsibleParty = entity;
          return director;
        });
      } else {
        entity.directors = [];
      }
    }

    if (updateDto.corporateSummaryUuid) {
      const corporateSummary = await this.documentRepository.findOne({
        where: {
          uuid: updateDto.corporateSummaryUuid,
        },
      });

      entity.corporateSummary = corporateSummary ?? undefined;
    }

    const savedEntity = await this.repository.save(entity);

    return this.mapper.map(
      savedEntity,
      ComplianceAndEnforcementResponsibleParty,
      ComplianceAndEnforcementResponsiblePartyDto,
    );
  }

  async delete(uuid: string): Promise<DeleteResult> {
    const entity = await this.repository.findOne({
      where: { uuid },
      relations: ['directors'],
    });

    if (!entity) {
      throw new ServiceNotFoundException('Responsible party not found. Unable to delete.');
    }

    return await this.repository.delete(uuid);
  }
}

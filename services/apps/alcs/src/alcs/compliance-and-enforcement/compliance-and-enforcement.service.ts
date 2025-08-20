import { Injectable } from '@nestjs/common';
import { DeleteResult, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplianceAndEnforcement } from './compliance-and-enforcement.entity';
import { ComplianceAndEnforcementDto, UpdateComplianceAndEnforcementDto } from './compliance-and-enforcement.dto';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import {
  ServiceConflictException,
  ServiceNotFoundException,
  ServiceValidationException,
} from '../../../../../libs/common/src/exceptions/base.exception';
import { ComplianceAndEnforcementSubmitterService } from './submitter/submitter.service';
import { ComplianceAndEnforcementPropertyService } from './property/property.service';
import { ComplianceAndEnforcementDocument } from './document/document.entity';
import {
  ComplianceAndEnforcementValidatorService,
  ValidatedComplianceAndEnforcement,
} from './compliance-and-enforcement-validator.service';

export enum Status {
  OPEN = 'Open',
  CLOSED = 'Closed',
}

@Injectable()
export class ComplianceAndEnforcementService {
  constructor(
    @InjectRepository(ComplianceAndEnforcement)
    private repository: Repository<ComplianceAndEnforcement>,
    @InjectMapper() private mapper: Mapper,
    private readonly submitterService: ComplianceAndEnforcementSubmitterService,
    private readonly propertyService: ComplianceAndEnforcementPropertyService,
    private readonly validatorService: ComplianceAndEnforcementValidatorService,
  ) {}

  async fetchAll(): Promise<ComplianceAndEnforcementDto[]> {
    const entity = await this.repository.find({
      order: {
        fileNumber: 'DESC',
      },
    });
    return this.mapper.mapArray(entity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }

  async fetchByUuid(
    uuid: string,
    withSubmitters = false,
    withProperties = false,
  ): Promise<ComplianceAndEnforcementDto> {
    const entity = await this.repository.findOne({
      where: {
        uuid,
      },
      relations: {
        submitters: withSubmitters,
        properties: withProperties,
      },
    });

    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this file number does not exist.');
    }

    return this.mapper.map(entity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }

  async fetchByFileNumber(
    fileNumber: string,
    withSubmitters = false,
    withProperty = false,
  ): Promise<ComplianceAndEnforcementDto> {
    const entity = await this.repository.findOne({
      where: {
        fileNumber,
      },
      relations: {
        submitters: withSubmitters,
        properties: withProperty && {
          localGovernment: true,
        },
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
    createInitialProperty = false,
  ): Promise<ComplianceAndEnforcementDto> {
    const entity = this.mapper.map(dto, UpdateComplianceAndEnforcementDto, ComplianceAndEnforcement);

    const savedEntity = await this.repository.save(entity);

    if (createInitialSubmitter) {
      await this.submitterService.create({ fileUuid: entity.uuid });
    }

    if (createInitialProperty) {
      await this.propertyService.create({ fileUuid: entity.uuid });
    }

    return this.mapper.map(savedEntity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }

  async update(
    id: string,
    updateDto: UpdateComplianceAndEnforcementDto,
    options: { idType: string } = { idType: 'uuid' },
  ): Promise<ComplianceAndEnforcementDto> {
    const entity = await this.repository.findOneBy({ [options.idType]: id });
    if (entity === null) {
      throw new ServiceConflictException('A C&E file with this UUID does not exist. Unable to update.');
    }

    const updateEntity = this.mapper.map(updateDto, UpdateComplianceAndEnforcementDto, ComplianceAndEnforcement);
    updateEntity.uuid = entity.uuid;
    updateEntity.fileNumber = entity.fileNumber;

    const savedEntity = await this.repository.save(updateEntity);

    return this.mapper.map(savedEntity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }

  async setStatus(
    id: string,
    status: Status,
    options: { idType: string } = { idType: 'uuid' },
  ): Promise<ComplianceAndEnforcementDto> {
    const entity = await this.repository.findOneBy({ [options.idType]: id });
    if (entity === null) {
      throw new ServiceConflictException('A C&E file with this UUID does not exist. Unable to update.');
    }

    const updateDto: UpdateComplianceAndEnforcementDto = {};

    if (status === Status.CLOSED) {
      updateDto.dateClosed = new Date().getTime();
    }

    if (status === Status.OPEN) {
      if (!entity.dateOpened) {
        updateDto.dateOpened = new Date().getTime();
      }

      if (entity.dateClosed) {
        updateDto.dateClosed = null;
      }
    }

    return this.update(id, updateDto, options);
  }

  async delete(uuid: string): Promise<DeleteResult> {
    const manager: any = this.repository.manager as any;

    if (!manager || typeof manager.transaction !== 'function') {
      const entity = await this.repository.findOneBy({ uuid });
      if (!entity) {
        throw new ServiceNotFoundException('A C&E file with this UUID does not exist. Unable to delete.');
      }
      return await this.repository.delete(uuid);
    }

    return await this.repository.manager.transaction(async (manager) => {
      const file = await manager.findOne(ComplianceAndEnforcement, {
        where: { uuid },
      });

      if (!file) {
        throw new ServiceNotFoundException('A C&E file with this UUID does not exist. Unable to delete.');
      }

      // Delete C&E document link records for this file
      const ceDocuments = await manager.find(ComplianceAndEnforcementDocument, {
        where: { file: { uuid: file.uuid } },
        relations: ['document', 'type'],
      });
      if (ceDocuments.length > 0) {
        await manager.delete(ComplianceAndEnforcementDocument, { uuid: In(ceDocuments.map((d) => d.uuid)) });
      }

      // Delete Responsible Party Directors, then Parties
      const parties = await manager.find(
        (await import('./responsible-parties/responsible-party.entity')).ComplianceAndEnforcementResponsibleParty,
        { where: { fileUuid: file.uuid }, relations: ['directors'] },
      );
      const directorUuids = parties.flatMap((p: any) => (p.directors ? p.directors.map((d: any) => d.uuid) : []));
      if (directorUuids.length > 0) {
        const Director = (await import('./responsible-parties/responsible-party-director.entity'))
          .ComplianceAndEnforcementResponsiblePartyDirector;
        await manager.delete(Director, { uuid: In(directorUuids) });
      }
      if (parties.length > 0) {
        const Party = (await import('./responsible-parties/responsible-party.entity'))
          .ComplianceAndEnforcementResponsibleParty;
        await manager.delete(Party, { fileUuid: file.uuid });
      }

      // Delete Properties
      const Property = (await import('./property/property.entity')).ComplianceAndEnforcementProperty;
      await manager.delete(Property, { fileUuid: file.uuid });

      // Delete Submitters (filter by file relation)
      const Submitter = (await import('./submitter/submitter.entity')).ComplianceAndEnforcementSubmitter;
      const submitters = await manager.find(Submitter, { where: { file: { uuid: file.uuid } } });
      if (submitters.length > 0) {
        await manager.delete(Submitter, { uuid: In(submitters.map((s: any) => s.uuid)) });
      }

      // Finally delete the C&E File at the end of all the other deletions
      return await manager.delete(ComplianceAndEnforcement, { uuid: file.uuid });
    });
  }

  async submit(uuid: string): Promise<ComplianceAndEnforcementDto> {
    // Get the C&E file with all related data
    const entity = await this.repository.findOne({
      where: { uuid },
      relations: ['submitters', 'properties', 'responsibleParties'],
    });

    if (!entity) {
      throw new ServiceNotFoundException('A C&E file with this UUID does not exist. Unable to submit.');
    }

    // Get submitters, properties, and responsible parties
    const submitters = await this.submitterService.fetchByFileNumber(entity.fileNumber);
    const properties = await this.propertyService.fetchParcels(entity.fileNumber);

    // Get responsible parties with directors
    const responsibleParties = await this.repository.manager.find(
      (await import('./responsible-parties/responsible-party.entity')).ComplianceAndEnforcementResponsibleParty,
      {
        where: { fileUuid: uuid },
        relations: ['directors'],
      },
    );

    // Validate the submission
    const validationResult = await this.validatorService.validateSubmission(
      entity,
      submitters,
      properties,
      responsibleParties,
    );

    if (validationResult.errors.length > 0) {
      // Create a detailed error message
      const errorMessages = validationResult.errors.map((error) => error.message).join('; ');
      throw new ServiceValidationException(`Validation failed: ${errorMessages}`);
    }

    // If validation passes, mark as submitted
    const validatedSubmission = validationResult.validatedSubmission as ValidatedComplianceAndEnforcement;
    validatedSubmission.dateOpened = new Date();

    const savedEntity = await this.repository.save(validatedSubmission);

    return this.mapper.map(savedEntity, ComplianceAndEnforcement, ComplianceAndEnforcementDto);
  }
}

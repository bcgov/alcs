import { Injectable } from '@nestjs/common';
import { DeleteResult, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplianceAndEnforcementDocument, Section } from './document.entity';
import { ComplianceAndEnforcementDocumentDto, UpdateComplianceAndEnforcementDocumentDto } from './document.dto';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../libs/common/src/exceptions/base.exception';
import { DocumentService } from '../../../document/document.service';
import { User } from '../../../user/user.entity';
import { DOCUMENT_TYPE, DocumentCode } from '../../../document/document-code.entity';
import { CreateDocumentDto } from '../../../document/document.dto';
import { MultipartFile } from '@fastify/multipart';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';
import { ComplianceAndEnforcementPropertyService } from '../property/property.service';
import { ComplianceAndEnforcementResponsiblePartyService } from '../responsible-parties/responsible-parties.service';

@Injectable()
export class ComplianceAndEnforcementDocumentService {
  constructor(
    private documentService: DocumentService,
    private propertyService: ComplianceAndEnforcementPropertyService,
    private responsiblePartyService: ComplianceAndEnforcementResponsiblePartyService,
    @InjectRepository(ComplianceAndEnforcementDocument)
    private repository: Repository<ComplianceAndEnforcementDocument>,
    @InjectRepository(ComplianceAndEnforcement)
    private complianceAndEnforcementRepository: Repository<ComplianceAndEnforcement>,
    @InjectRepository(DocumentCode)
    private documentCodeRepository: Repository<DocumentCode>,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async list(fileNumber?: string, section?: Section): Promise<ComplianceAndEnforcementDocumentDto[]> {
    const entities = await this.repository.find({
      where: {
        file: {
          fileNumber: fileNumber,
        },
        section,
      },
      relations: ['type', 'document'],
      order: {
        document: {
          uploadedAt: 'DESC',
        },
      },
    });

    if (entities === null) {
      throw new ServiceNotFoundException('A C&E file with this file number does not exist.');
    }

    return this.mapper.mapArray(entities, ComplianceAndEnforcementDocument, ComplianceAndEnforcementDocumentDto);
  }

  async getByUuid(uuid: string): Promise<ComplianceAndEnforcementDocumentDto> {
    const entity = await this.repository.findOne({
      where: { uuid },
      relations: ['type', 'document'],
    });

    return this.mapper.map(entity, ComplianceAndEnforcementDocument, ComplianceAndEnforcementDocumentDto);
  }

  async create(
    fileNumber: string,
    user: User,
    uploadData: MultipartFile,
    createDto: CreateDocumentDto,
    propertyUuid?: string,
    responsiblePartyUuid?: string,
  ): Promise<ComplianceAndEnforcementDocumentDto> {
    const document = await this.documentService.create(
      `compliance-and-enforcement/${fileNumber}`,
      createDto.fileName,
      uploadData,
      user,
      createDto.source,
      createDto.system,
      ['86000-20'],
    );

    const file = await this.complianceAndEnforcementRepository.findOneBy({ fileNumber });

    if (!file) {
      throw new ServiceNotFoundException('Compliance and Enforcement file not found.');
    }

    const type = await this.documentCodeRepository.findOneBy({ code: createDto.typeCode });

    if (!type) {
      throw new ServiceNotFoundException(`Document type with code ${createDto.typeCode} not found.`);
    }

    const entity = new ComplianceAndEnforcementDocument({
      file,
      document,
      type,
      section: createDto.section,
    });

    const savedEntity = await this.repository.save(entity);

    if (propertyUuid && createDto.typeCode === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
      await this.updateProperty(propertyUuid, entity.uuid);
    }

    if (responsiblePartyUuid && createDto.typeCode === DOCUMENT_TYPE.CORPORATE_SUMMARY) {
      await this.updateResponsibleParty(responsiblePartyUuid, entity.uuid);
    }

    return this.mapper.map(savedEntity, ComplianceAndEnforcementDocument, ComplianceAndEnforcementDocumentDto);
  }

  private async updateProperty(propertyUuid: string, certificateOfTitleUuid: string) {
    this.propertyService.update(propertyUuid, {
      certificateOfTitleUuid,
    });
  }

  private async updateResponsibleParty(propertyUuid: string, corporateSummaryUuid: string) {
    this.responsiblePartyService.update(propertyUuid, {
      corporateSummaryUuid,
    });
  }

  async update(
    uuid: string,
    updateDto: UpdateComplianceAndEnforcementDocumentDto,
  ): Promise<ComplianceAndEnforcementDocumentDto> {
    const entity = await this.repository.findOne({ where: { uuid }, relations: ['document', 'file', 'type'] });
    if (entity === null) {
      throw new ServiceConflictException('A C&E file with this UUID does not exist. Unable to update.');
    }

    if (updateDto.fileName) {
      entity.document.fileName = updateDto.fileName;
    }
    if (updateDto.source) {
      entity.document.source = updateDto.source;
    }

    if (updateDto.typeCode) {
      const type = await this.documentCodeRepository.findOneBy({ code: updateDto.typeCode });
      if (!type) {
        throw new ServiceNotFoundException(`Document type with code ${updateDto.typeCode} not found.`);
      }

      entity.type = type;
    }

    const savedEntity = await this.repository.save(entity);

    if (updateDto.parcelUuid && updateDto.typeCode === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
      await this.updateProperty(updateDto.parcelUuid, entity.uuid);
    }

    if (updateDto.ownerUuid && updateDto.typeCode === DOCUMENT_TYPE.CORPORATE_SUMMARY) {
      await this.updateResponsibleParty(updateDto.ownerUuid, entity.uuid);
    }

    return this.mapper.map(savedEntity, ComplianceAndEnforcementDocument, ComplianceAndEnforcementDocumentDto);
  }

  async delete(uuid: string): Promise<DeleteResult> {
    const entity = await this.repository.findOneBy({ uuid });
    if (entity === null) {
      throw new ServiceNotFoundException('A C&E file with this UUID does not exist. Unable to delete.');
    }

    return await this.repository.delete(uuid);
  }

  async fetchTypes(allowedCodes: string[] = []): Promise<DocumentCode[]> {
    return await this.documentCodeRepository.find({
      where: {
        code: allowedCodes.length > 0 ? In(allowedCodes) : undefined,
      },
    });
  }
}

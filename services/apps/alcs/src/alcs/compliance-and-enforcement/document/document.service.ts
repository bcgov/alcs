import { Injectable } from '@nestjs/common';
import { DeleteResult, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplianceAndEnforcementDocument } from './document.entity';
import { ComplianceAndEnforcementDocumentDto, UpdateComplianceAndEnforcementDocumentDto } from './document.dto';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../libs/common/src/exceptions/base.exception';
import { DocumentService } from '../../../document/document.service';
import { User } from '../../../user/user.entity';
import { DocumentCode } from '../../../document/document-code.entity';
import { CreateDocumentDto } from '../../../document/document.dto';
import { MultipartFile } from '@fastify/multipart';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';

@Injectable()
export class ComplianceAndEnforcementDocumentService {
  constructor(
    private documentService: DocumentService,
    @InjectRepository(ComplianceAndEnforcementDocument)
    private repository: Repository<ComplianceAndEnforcementDocument>,
    @InjectRepository(ComplianceAndEnforcement)
    private complianceAndEnforcementRepository: Repository<ComplianceAndEnforcement>,
    @InjectRepository(DocumentCode)
    private documentCodeRepository: Repository<DocumentCode>,
    @InjectMapper() private mapper: Mapper,
  ) {}

  async list(fileNumber?: string, types: string[] = []): Promise<ComplianceAndEnforcementDocumentDto[]> {
    const entities = await this.repository.find({
      where: {
        file: {
          fileNumber: fileNumber,
        },
        type: types.length > 0 ? In(types) : undefined,
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

  async create(
    fileNumber: string,
    user: User,
    uploadData: MultipartFile,
    createDto: CreateDocumentDto,
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
    });

    const savedEntity = await this.repository.save(entity);

    return this.mapper.map(savedEntity, ComplianceAndEnforcementDocument, ComplianceAndEnforcementDocumentDto);
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

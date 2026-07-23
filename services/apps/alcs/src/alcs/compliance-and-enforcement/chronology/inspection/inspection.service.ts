import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { CdogsService } from '../../../../../../../libs/common/src/cdogs/cdogs.service';
import {
  ServiceConflictException,
  ServiceNotFoundException,
} from '../../../../../../../libs/common/src/exceptions/base.exception';
import { User } from '../../../../user/user.entity';
import { ComplianceAndEnforcementPropertyDto } from '../../property/property.dto';
import { ComplianceAndEnforcementProperty } from '../../property/property.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { InspectionDto, UpdateInspectionDto } from './inspection.dto';
import { ComplianceAndEnforcementChronologyInspection } from './inspection.entity';

export interface InspectionOptions {
  filterByUuid?: string;
  filterByEntryUuid?: string;
}

export interface InspectionReportData extends InspectionDto {
  fileNumber: string;
  property: ComplianceAndEnforcementPropertyDto;
}

@Injectable()
export class ComplianceAndEnforcementChronologyInspectionService {
  constructor(
    @InjectRepository(ComplianceAndEnforcementChronologyInspection)
    private repository: Repository<ComplianceAndEnforcementChronologyInspection>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(CONFIG_TOKEN) private readonly config: IConfig,
    private readonly documentGenerationService: CdogsService,
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

    const entities = await this.repository.find({
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

    return this.mapper.mapArray(entities, ComplianceAndEnforcementChronologyInspection, InspectionDto);
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

  async reportTemplateData(uuid: string, user: User) {
    const templatePath = `${this.config.get<string>('CDOGS.TEMPLATE_FOLDER')}/inspection-report/inspection-report-template.docx`;
    const inspectionEntity = await this.repository.findOne({
      where: { uuid },
      relations: {
        officer: true,
        entry: {
          file: {
            properties: {
              localGovernment: true,
            },
          },
        },
      },
    });

    if (!inspectionEntity) {
      throw new ServiceNotFoundException("Can't find inspection");
    }

    const propertyDto = this.mapper.map(
      inspectionEntity.entry.file.properties[0],
      ComplianceAndEnforcementProperty,
      ComplianceAndEnforcementPropertyDto,
    );

    const inspectionDto = this.mapper.map(
      inspectionEntity,
      ComplianceAndEnforcementChronologyInspection,
      InspectionDto,
    );

    const data: InspectionReportData = {
      ...inspectionDto,
      fileNumber: inspectionEntity.entry.file.fileNumber,
      property: propertyDto,
    };

    const document = this.documentGenerationService.generateDocument(
      'inspection-report-template',
      templatePath,
      data,
      'docx',
    );

    return document;
  }
}

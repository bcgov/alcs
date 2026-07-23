import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { UserDto } from '../../../user/user.dto';
import { User } from '../../../user/user.entity';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';
import { ComplianceAndEnforcementDocumentDto } from '../document/document.dto';
import { ComplianceAndEnforcementDocument } from '../document/document.entity';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from './chronology.dto';
import { ComplianceAndEnforcementChronologyEntry } from './chronology.entity';
import { InspectionDto } from './inspection/inspection.dto';
import { ComplianceAndEnforcementChronologyInspection } from './inspection/inspection.entity';

@Injectable()
export class ComplianceAndEnforcementChronologyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ComplianceAndEnforcementChronologyEntry,
        ComplianceAndEnforcementChronologyEntryDto,
        forMember(
          (dto) => dto.date,
          mapFrom((entity) => entity.date?.getTime()),
        ),
        forMember(
          (dto) => dto.author,
          mapFrom((entity) => (entity.author ? this.mapper.map(entity.author, User, UserDto) : entity.author)),
        ),
        forMember(
          (dto) => dto.fileUuid,
          mapFrom((entity) => entity.file?.uuid),
        ),
        forMember(
          (dto) => dto.documents,
          mapFrom((entity) =>
            entity.documents !== undefined && entity.documents !== null
              ? mapper.mapArray(entity.documents, ComplianceAndEnforcementDocument, ComplianceAndEnforcementDocumentDto)
              : undefined,
          ),
        ),
        forMember(
          (dto) => dto.inspections,
          mapFrom((entity) =>
            entity.inspections !== undefined && entity.inspections !== null
              ? mapper.mapArray(entity.inspections, ComplianceAndEnforcementChronologyInspection, InspectionDto)
              : undefined,
          ),
        ),
      );
      createMap(
        mapper,
        UpdateComplianceAndEnforcementChronologyEntryDto,
        ComplianceAndEnforcementChronologyEntry,
        forMember(
          (entity) => entity.date,
          mapFrom((dto) => (dto.date !== undefined && dto.date !== null ? new Date(dto.date) : dto.date)),
        ),
        forMember(
          (entity) => entity.author,
          mapFrom((dto) => new User({ uuid: dto.authorUuid })),
        ),
        forMember(
          (entity) => entity.file,
          mapFrom((dto) => (dto.fileUuid ? new ComplianceAndEnforcement({ uuid: dto.fileUuid }) : undefined)),
        ),
      );
    };
  }
}

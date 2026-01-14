import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from './chronology.dto';
import { ComplianceAndEnforcementChronologyEntry } from './chronology.entity';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';
import { ComplianceAndEnforcementDocument } from '../document/document.entity';
import { ComplianceAndEnforcementDocumentDto } from '../document/document.dto';
import { User } from '../../../user/user.entity';
import { UserDto } from '../../../user/user.dto';

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
          mapFrom((dto) => new ComplianceAndEnforcement({ uuid: dto.fileUuid })),
        ),
      );
    };
  }
}

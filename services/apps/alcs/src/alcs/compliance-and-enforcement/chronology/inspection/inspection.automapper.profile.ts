import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { UserDto } from '../../../../user/user.dto';
import { User } from '../../../../user/user.entity';
import { ComplianceAndEnforcementDocumentDto } from '../../document/document.dto';
import { ComplianceAndEnforcementDocument } from '../../document/document.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { InspectionDto, UpdateInspectionDto } from './inspection.dto';
import { ComplianceAndEnforcementChronologyInspection } from './inspection.entity';

@Injectable()
export class ComplianceAndEnforcementChronologyInspectionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ComplianceAndEnforcementChronologyInspection,
        InspectionDto,
        forMember(
          (dto) => dto.createdAt,
          mapFrom((entity) => (entity.createdAt ? entity.createdAt.getTime() : undefined)),
        ),
        forMember(
          (dto) => dto.isDraft,
          mapFrom((entity) => entity.isDraft),
        ),
        forMember(
          (dto) => dto.date,
          mapFrom((entity) => entity.date),
        ),
        forMember(
          (dto) => dto.type,
          mapFrom((entity) => entity.type),
        ),
        forMember(
          (dto) => dto.officer,
          mapFrom((entity) => {
            return entity.officer ? this.mapper.map(entity.officer, User, UserDto) : entity.officer;
          }),
        ),
        forMember(
          (dto) => dto.allegedActivity,
          mapFrom((entity) => entity.allegedActivity),
        ),
        forMember(
          (dto) => dto.attendees,
          mapFrom((entity) => {
            return entity.attendees;
          }),
        ),
        forMember(
          (dto) => dto.comments,
          mapFrom((entity) => entity.comments),
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
          (dto) => dto.entryUuid,
          mapFrom((entity) => entity?.entry?.uuid),
        ),
      );
      createMap(
        mapper,
        UpdateInspectionDto,
        ComplianceAndEnforcementChronologyInspection,
        forMember(
          (entity) => entity.isDraft,
          mapFrom((dto) => dto.isDraft),
        ),
        forMember(
          (entity) => entity.date,
          mapFrom((dto) => dto.date),
        ),
        forMember(
          (entity) => entity.type,
          mapFrom((dto) => dto.type),
        ),
        forMember(
          (entity) => entity.officer,
          mapFrom((dto) => new User({ uuid: dto.officerUuid })),
        ),
        forMember(
          (entity) => entity.allegedActivity,
          mapFrom((dto) => dto.allegedActivity),
        ),
        forMember(
          (entity) => entity.attendees,
          mapFrom((dto) => dto.attendees),
        ),
        forMember(
          (entity) => entity.comments,
          mapFrom((dto) => dto.comments),
        ),
        forMember(
          (entity) => entity.entry,
          mapFrom((dto) =>
            dto.entryUuid ? new ComplianceAndEnforcementChronologyEntry({ uuid: dto.entryUuid }) : undefined,
          ),
        ),
      );
    };
  }
}

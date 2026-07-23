import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { ComplianceAndEnforcementDocumentDto } from '../../document/document.dto';
import { ComplianceAndEnforcementDocument } from '../../document/document.entity';
import { ComplianceAndEnforcementChronologyEntry } from '../chronology.entity';
import { ComplianceAndEnforcementNoticeDueDate } from './due-date/due-date.entity';
import { NoticeDto, NoticeDueDateDto, UpdateNoticeDto, UpdateNoticeDueDateDto } from './notice.dto';
import { ComplianceAndEnforcementNotice } from './notice.entity';

@Injectable()
export class ComplianceAndEnforcementNoticeProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ComplianceAndEnforcementNotice,
        NoticeDto,
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
          (dto) => dto.allegedActivity,
          mapFrom((entity) => entity.allegedActivity),
        ),
        forMember(
          (dto) => dto.notifications,
          mapFrom((entity) => entity.notifications),
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
        forMember(
          (dto) => dto.dueDates,
          mapFrom((entity) =>
            entity.dueDates
              ? this.mapper.mapArray(entity.dueDates, ComplianceAndEnforcementNoticeDueDate, NoticeDueDateDto)
              : undefined,
          ),
        ),
        forMember(
          (dto) => dto.issuedToIndividualResponsiblePartyUuid,
          mapFrom((entity) =>
            entity.issuedToIndividualResponsibleParty ? entity.issuedToIndividualResponsibleParty.uuid : null,
          ),
        ),
        forMember(
          (dto) => dto.issuedToDirectorUuid,
          mapFrom((entity) => (entity.issuedToDirector ? entity.issuedToDirector.uuid : null)),
        ),
      );
      createMap(
        mapper,
        UpdateNoticeDto,
        ComplianceAndEnforcementNotice,
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
          (entity) => entity.allegedActivity,
          mapFrom((dto) => dto.allegedActivity),
        ),
        forMember(
          (entity) => entity.notifications,
          mapFrom((dto) => dto.notifications),
        ),
        forMember(
          (entity) => entity.entry,
          mapFrom((dto) =>
            dto.entryUuid ? new ComplianceAndEnforcementChronologyEntry({ uuid: dto.entryUuid }) : undefined,
          ),
        ),
        forMember(
          (entity) => entity.dueDates,
          mapFrom((dto) =>
            dto.dueDates
              ? this.mapper.mapArray(dto.dueDates, UpdateNoticeDueDateDto, ComplianceAndEnforcementNoticeDueDate)
              : undefined,
          ),
        ),
      );
      createMap(
        mapper,
        ComplianceAndEnforcementNoticeDueDate,
        NoticeDueDateDto,
        forMember(
          (dto) => dto.uuid,
          mapFrom((entity) => entity.uuid),
        ),
        forMember(
          (dto) => dto.date,
          mapFrom((entity) => entity.date),
        ),
        forMember(
          (dto) => dto.completedDate,
          mapFrom((entity) => entity.completedDate?.getTime()),
        ),
        forMember(
          (dto) => dto.comment,
          mapFrom((entity) => entity.comment),
        ),
      );
      createMap(
        mapper,
        UpdateNoticeDueDateDto,
        ComplianceAndEnforcementNoticeDueDate,
        forMember(
          (entity) => entity.uuid,
          mapFrom((dto) => dto.uuid),
        ),
        forMember(
          (entity) => entity.notice,
          mapFrom((dto) => new ComplianceAndEnforcementNotice({ uuid: dto.noticeUuid })),
        ),
        forMember(
          (entity) => entity.date,
          mapFrom((dto) => dto.date),
        ),
        forMember(
          (entity) => entity.completedDate,
          mapFrom((dto) => (dto.completedDate ? new Date(dto.completedDate) : null)),
        ),
        forMember(
          (entity) => entity.comment,
          mapFrom((dto) => dto.comment),
        ),
      );
    };
  }
}

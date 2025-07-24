import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { ComplianceAndEnforcementDocument } from './document.entity';
import { ComplianceAndEnforcementDocumentDto, UpdateComplianceAndEnforcementDocumentDto } from './document.dto';

@Injectable()
export class ComplianceAndEnforcementDocumentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ComplianceAndEnforcementDocument,
        ComplianceAndEnforcementDocumentDto,
        forMember(
          (dto) => dto.documentUuid,
          mapFrom((entity) => entity.document.uuid),
        ),
        forMember(
          (dto) => dto.source,
          mapFrom((entity) => entity.document.source),
        ),
        forMember(
          (dto) => dto.system,
          mapFrom((entity) => entity.document.system),
        ),
        forMember(
          (dto) => dto.fileName,
          mapFrom((entity) => entity.document.fileName),
        ),
        forMember(
          (dto) => dto.mimeType,
          mapFrom((entity) => entity.document.mimeType),
        ),
        forMember(
          (dto) => dto.uploadedAt,
          mapFrom((entity) => entity.document.uploadedAt.getTime()),
        ),
      );

      createMap(mapper, UpdateComplianceAndEnforcementDocumentDto, ComplianceAndEnforcementDocument);
    };
  }
}

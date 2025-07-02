import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { ComplianceAndEnforcementSubmitter } from './submitter.entity';
import { ComplianceAndEnforcementSubmitterDto, UpdateComplianceAndEnforcementSubmitterDto } from './submitter.dto';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';

@Injectable()
export class ComplianceAndEnforcementSubmitterProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ComplianceAndEnforcementSubmitter,
        ComplianceAndEnforcementSubmitterDto,
        forMember(
          (dto) => dto.dateAdded,
          mapFrom((entity) => entity.dateAdded?.getTime()),
        ),
      );

      createMap(
        mapper,
        UpdateComplianceAndEnforcementSubmitterDto,
        ComplianceAndEnforcementSubmitter,
        forMember(
          (entity) => entity.dateAdded,
          mapFrom((dto) =>
            dto.dateAdded !== undefined && dto.dateAdded !== null ? new Date(dto.dateAdded) : dto.dateAdded,
          ),
        ),
        forMember(
          (entity) => entity.file,
          mapFrom((dto) => new ComplianceAndEnforcement({ uuid: dto.fileUuid })),
        ),
      );
    };
  }
}

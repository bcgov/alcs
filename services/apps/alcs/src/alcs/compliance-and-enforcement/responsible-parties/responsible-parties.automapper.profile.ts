import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { ComplianceAndEnforcement } from '../compliance-and-enforcement.entity';
import { 
  ComplianceAndEnforcementResponsibleParty, 
  ComplianceAndEnforcementResponsiblePartyDirector 
} from './entities';
import { 
  ComplianceAndEnforcementResponsiblePartyDto, 
  ComplianceAndEnforcementResponsiblePartyDirectorDto,
  CreateComplianceAndEnforcementResponsiblePartyDto,
  UpdateComplianceAndEnforcementResponsiblePartyDto,
  CreateComplianceAndEnforcementResponsiblePartyDirectorDto,
  UpdateComplianceAndEnforcementResponsiblePartyDirectorDto
} from './responsible-parties.dto';

@Injectable()
export class ComplianceAndEnforcementResponsiblePartyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      // Director mappings
      createMap(
        mapper,
        ComplianceAndEnforcementResponsiblePartyDirector,
        ComplianceAndEnforcementResponsiblePartyDirectorDto,
      );

      // Responsible Party main mapping
      createMap(
        mapper,
        ComplianceAndEnforcementResponsibleParty,
        ComplianceAndEnforcementResponsiblePartyDto,
        forMember(
          (dto) => dto.ownerSince,
          mapFrom((entity) => entity.ownerSince?.getTime() || null),
        ),
        forMember(
          (dto) => dto.directors,
          mapFrom((entity) =>
            entity.directors !== undefined
              ? this.mapper.mapArray(
                  entity.directors,
                  ComplianceAndEnforcementResponsiblePartyDirector,
                  ComplianceAndEnforcementResponsiblePartyDirectorDto,
                )
              : entity.directors,
          ),
        ),
      );

      // Create DTO to Entity mappings
      createMap(
        mapper,
        CreateComplianceAndEnforcementResponsiblePartyDto,
        ComplianceAndEnforcementResponsibleParty,
        forMember(
          (entity) => entity.file,
          mapFrom((dto) => new ComplianceAndEnforcement({ uuid: dto.fileUuid })),
        ),
        forMember(
          (entity) => entity.ownerSince,
          mapFrom((dto) =>
            dto.ownerSince !== undefined && dto.ownerSince !== null
              ? new Date(dto.ownerSince)
              : dto.ownerSince,
          ),
        ),
        forMember(
          (entity) => entity.directors,
          mapFrom(() => undefined), // Handle directors separately in service
        ),
      );

      // Update DTO to Entity mappings
      createMap(
        mapper,
        UpdateComplianceAndEnforcementResponsiblePartyDto,
        ComplianceAndEnforcementResponsibleParty,
        forMember(
          (entity) => entity.ownerSince,
          mapFrom((dto) =>
            dto.ownerSince !== undefined && dto.ownerSince !== null
              ? new Date(dto.ownerSince)
              : dto.ownerSince,
          ),
        ),
        forMember(
          (entity) => entity.directors,
          mapFrom(() => undefined), // Handle directors separately in service
        ),
      );
    };
  }
}

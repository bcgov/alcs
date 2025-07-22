import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { createMap, Mapper } from 'automapper-core';
import { Injectable } from '@nestjs/common';
import { ComplianceAndEnforcementProperty } from './property.entity';
import { ComplianceAndEnforcementPropertyDto, UpdateComplianceAndEnforcementPropertyDto } from './property.dto';

@Injectable()
export class ComplianceAndEnforcementPropertyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        ComplianceAndEnforcementProperty,
        ComplianceAndEnforcementPropertyDto,
      );

      createMap(
        mapper,
        UpdateComplianceAndEnforcementPropertyDto,
        ComplianceAndEnforcementProperty,
      );
    };
  }
} 
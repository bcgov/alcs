import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDto } from '../../alcs/application/application.dto';
import { CommissionerApplicationDto } from '../../alcs/commissioner/commissioner.dto';

@Injectable()
export class CommissionerProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ApplicationDto, CommissionerApplicationDto);
    };
  }
}

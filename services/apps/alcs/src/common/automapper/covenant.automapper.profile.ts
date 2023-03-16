import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CovenantDto } from '../../alcs/covenant/covenant.dto';
import { Covenant } from '../../alcs/covenant/covenant.entity';

@Injectable()
export class CovenantProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, Covenant, CovenantDto);
    };
  }
}

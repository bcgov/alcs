import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ReconsiderationTypeDto } from '../../reconsideration/reconsideration-type/reconsideration-type.dto';
import { ReconsiderationType } from '../../reconsideration/reconsideration-type/reconsideration-type.entity';

@Injectable()
export class ReconsiderationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ReconsiderationType, ReconsiderationTypeDto);
    };
  }
}

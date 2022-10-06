import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationReconsideration } from '../../application/application-reconsideration/application-reconsideration.entity';
import {
  ApplicationReconsiderationCreateDto,
  ReconsiderationTypeDto,
} from '../../application/application-reconsideration/applicationReconsideration.dto';
import { ReconsiderationType } from '../../application/application-reconsideration/reconsideration-type/reconsideration-type.entity';
import { Application } from '../../application/application.entity';

@Injectable()
export class ReconsiderationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ReconsiderationType, ReconsiderationTypeDto);

      createMap(
        mapper,
        ApplicationReconsiderationCreateDto,
        ApplicationReconsideration,
      );

      createMap(mapper, ApplicationReconsiderationCreateDto, Application);
    };
  }
}

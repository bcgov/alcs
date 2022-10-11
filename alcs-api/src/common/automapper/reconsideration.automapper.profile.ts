import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationReconsideration } from '../../application/application-reconsideration/application-reconsideration.entity';
import {
  ApplicationDto,
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationWithoutApplicationDto,
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
        forMember(
          (r) => r.submittedDate,
          mapFrom((rd) => new Date(rd.submittedDate)),
        ),
      );

      createMap(
        mapper,
        ApplicationReconsiderationCreateDto,
        Application,
        forMember(
          (a) => a.fileNumber,
          mapFrom((rd) => rd.applicationFileNumber),
        ),
      );

      createMap(
        mapper,
        Application,
        ApplicationDto,
        forMember(
          (a) => a.localGovernment,
          mapFrom((rd) => rd.localGovernment.name),
        ),
      );

      createMap(mapper, ReconsiderationType, ReconsiderationTypeDto);

      createMap(
        mapper,
        ApplicationReconsideration,
        ApplicationReconsiderationDto,
        forMember(
          (a) => a.application,
          mapFrom((rd) =>
            this.mapper.map(rd.application, Application, ApplicationDto),
          ),
        ),
      );

      createMap(
        mapper,
        ApplicationReconsideration,
        ApplicationReconsiderationWithoutApplicationDto,
      );
    };
  }
}

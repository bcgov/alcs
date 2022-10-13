import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDecisionMeetingDto } from '../../application/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../application/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationReconsideration } from '../../application/application-reconsideration/application-reconsideration.entity';
import {
  ApplicationForReconsiderationDto,
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationWithoutApplicationDto,
  ReconsiderationTypeDto,
} from '../../application/application-reconsideration/applicationReconsideration.dto';
import { ApplicationReconsiderationType } from '../../application/application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { Application } from '../../application/application.entity';

@Injectable()
export class ReconsiderationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ApplicationReconsiderationType, ReconsiderationTypeDto);

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
        ApplicationForReconsiderationDto,
        forMember(
          (a) => a.localGovernment,
          mapFrom((rd) => rd.localGovernment.name),
        ),
        forMember(
          (a) => a.decisionMeetings,
          mapFrom((a) =>
            this.mapper.mapArray(
              a.decisionMeetings,
              ApplicationDecisionMeeting,
              ApplicationDecisionMeetingDto,
            ),
          ),
        ),
      );

      createMap(mapper, ApplicationReconsiderationType, ReconsiderationTypeDto);

      createMap(
        mapper,
        ApplicationReconsideration,
        ApplicationReconsiderationDto,
        forMember(
          (a) => a.application,
          mapFrom((rd) =>
            this.mapper.map(
              rd.application,
              Application,
              ApplicationForReconsiderationDto,
            ),
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

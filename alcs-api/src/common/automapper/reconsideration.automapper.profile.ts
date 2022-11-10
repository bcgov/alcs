import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationReconsideration } from '../../decision/application-reconsideration/application-reconsideration.entity';
import {
  ApplicationForReconsiderationDto,
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationWithoutApplicationDto,
  ReconsiderationTypeDto,
} from '../../decision/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationType } from '../../decision/application-reconsideration/reconsideration-type/application-reconsideration-type.entity';
import { ApplicationDecisionMeetingDto } from '../../application/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../application/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionDto } from '../../decision/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../decision/application-decision/application-decision.entity';
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
        forMember(
          (a) => a.submittedDate,
          mapFrom((rd) => rd.submittedDate.getTime()),
        ),
        forMember(
          (a) => a.reviewDate,
          mapFrom((rd) =>
            rd.reviewDate ? rd.reviewDate.getTime() : undefined,
          ),
        ),
        forMember(
          (a) => a.reconsideredDecisions,
          mapFrom((rd) =>
            this.mapper.mapArray(
              rd.reconsidersDecisions,
              ApplicationDecision,
              ApplicationDecisionDto,
            ),
          ),
        ),
        forMember(
          (a) => a.resultingDecision,
          mapFrom((rd) =>
            this.mapper.map(
              rd.resultingDecision,
              ApplicationDecision,
              ApplicationDecisionDto,
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

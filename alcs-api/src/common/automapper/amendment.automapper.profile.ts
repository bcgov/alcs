import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  ApplicationAmendmentDto,
  ApplicationForAmendmentDto,
} from '../../application-amendment/application-amendment.dto';
import { ApplicationAmendment } from '../../application-amendment/application-amendment.entity';
import { ApplicationLocalGovernmentDto } from '../../application/application-code/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernment } from '../../application/application-code/application-local-government/application-local-government.entity';
import { ApplicationDecisionMeetingDto } from '../../application/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../application/application-decision-meeting/application-decision-meeting.entity';
import { Application } from '../../application/application.entity';

@Injectable()
export class AmendmentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        Application,
        ApplicationForAmendmentDto,
        forMember(
          (a) => a.localGovernment,
          mapFrom((a) =>
            this.mapper.map(
              a.localGovernment,
              ApplicationLocalGovernment,
              ApplicationLocalGovernmentDto,
            ),
          ),
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

      createMap(
        mapper,
        ApplicationAmendment,
        ApplicationAmendmentDto,
        forMember(
          (a) => a.application,
          mapFrom((rd) =>
            this.mapper.map(
              rd.application,
              Application,
              ApplicationForAmendmentDto,
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
      );
    };
  }
}

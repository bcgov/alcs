import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Application } from '../../application/application.entity';
import { CardDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';
import { ApplicationDecisionMeetingDto } from '../../decision/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../decision/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionDto } from '../../decision/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../decision/application-decision/application-decision.entity';
import {
  ApplicationForReconsiderationDto,
  ApplicationReconsiderationCreateDto,
  ApplicationReconsiderationDto,
  ApplicationReconsiderationOutcomeCodeDto,
  ApplicationReconsiderationWithoutApplicationDto,
  ReconsiderationTypeDto,
} from '../../decision/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsideration } from '../../decision/application-reconsideration/application-reconsideration.entity';
import { ApplicationReconsiderationOutcomeType } from '../../decision/application-reconsideration/reconsideration-outcome-type/application-reconsideration-outcome-type.entity';
import { ApplicationReconsiderationType } from '../../decision/application-reconsideration/reconsideration-type/application-reconsideration-type.entity';

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
          (a) => a.card,
          mapFrom((rd) => this.mapper.map(rd.card, Card, CardDto)),
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
        forMember(
          (a) => a.reviewOutcome,
          mapFrom((rd) =>
            this.mapper.map(
              rd.reviewOutcome,
              ApplicationReconsiderationOutcomeType,
              ApplicationReconsiderationOutcomeCodeDto,
            ),
          ),
        ),
      );

      createMap(
        mapper,
        ApplicationReconsiderationOutcomeType,
        ApplicationReconsiderationOutcomeCodeDto,
      );

      createMap(
        mapper,
        ApplicationReconsideration,
        ApplicationReconsiderationWithoutApplicationDto,
      );
    };
  }
}

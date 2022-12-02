import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationLocalGovernmentDto } from '../../application/application-code/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernment } from '../../application/application-code/application-local-government/application-local-government.entity';
import { Application } from '../../application/application.entity';
import { CardDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';
import { ApplicationDecisionMeetingDto } from '../../decision/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../decision/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionDto } from '../../decision/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../decision/application-decision/application-decision.entity';
import {
  ApplicationForModificationDto,
  ApplicationModificationDto,
  ApplicationModificationOutcomeCodeDto,
} from '../../decision/application-modification/application-modification.dto';
import { ApplicationModification } from '../../decision/application-modification/application-modification.entity';
import { ApplicationModificationOutcomeType } from '../../decision/application-modification/modification-outcome-type/application-modification-outcome-type.entity';

@Injectable()
export class ModificationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationModificationOutcomeType,
        ApplicationModificationOutcomeCodeDto,
      );

      createMap(
        mapper,
        Application,
        ApplicationForModificationDto,
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
        ApplicationModification,
        ApplicationModificationDto,
        forMember(
          (a) => a.application,
          mapFrom((rd) =>
            this.mapper.map(
              rd.application,
              Application,
              ApplicationForModificationDto,
            ),
          ),
        ),
        forMember(
          (a) => a.submittedDate,
          mapFrom((rd) => rd.submittedDate.getTime()),
        ),
        forMember(
          (a) => a.reviewDate,
          mapFrom((rd) => rd.reviewDate?.getTime()),
        ),
        forMember(
          (a) => a.reviewOutcome,
          mapFrom((rd) =>
            this.mapper.map(
              rd.reviewOutcome,
              ApplicationModificationOutcomeType,
              ApplicationModificationOutcomeCodeDto,
            ),
          ),
        ),
        forMember(
          (a) => a.modifiesDecisions,
          mapFrom((rd) =>
            this.mapper.mapArray(
              rd.modifiesDecisions,
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
          (a) => a.card,
          mapFrom((rd) => this.mapper.map(rd.card, Card, CardDto)),
        ),
      );
    };
  }
}

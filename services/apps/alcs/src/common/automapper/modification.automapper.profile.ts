import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationLocalGovernmentDto } from '../../alcs/application/application-code/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { Application } from '../../alcs/application/application.entity';
import { CardDto } from '../../alcs/card/card.dto';
import { Card } from '../../alcs/card/card.entity';
import { ApplicationDecision } from '../../alcs/decision/application-decision.entity';
import {
  ApplicationForModificationDto,
  ApplicationModificationDto,
  ApplicationModificationOutcomeCodeDto,
} from '../../alcs/decision/application-modification/application-modification.dto';
import { ApplicationModification } from '../../alcs/decision/application-modification/application-modification.entity';
import { ApplicationModificationOutcomeType } from '../../alcs/decision/application-modification/modification-outcome-type/application-modification-outcome-type.entity';
import { ApplicationDecisionMeetingDto } from '../../alcs/decision/decision-v1/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../alcs/decision/decision-v1/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionDto } from '../../alcs/decision/decision-v1/application-decision/application-decision.dto';

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

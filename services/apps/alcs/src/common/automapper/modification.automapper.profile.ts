import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { ApplicationDecisionMeeting } from '../../alcs/application/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionDto } from '../../alcs/application-decision/application-decision-v2/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../alcs/application-decision/application-decision.entity';
import { ApplicationModificationOutcomeType } from '../../alcs/application-decision/application-modification/application-modification-outcome-type/application-modification-outcome-type.entity';
import {
  ApplicationForModificationDto,
  ApplicationModificationDto,
  ApplicationModificationOutcomeCodeDto,
} from '../../alcs/application-decision/application-modification/application-modification.dto';
import { ApplicationModification } from '../../alcs/application-decision/application-modification/application-modification.entity';
import { Application } from '../../alcs/application/application.entity';
import { CardDto } from '../../alcs/card/card.dto';
import { Card } from '../../alcs/card/card.entity';
import { LocalGovernmentDto } from '../../alcs/local-government/local-government.dto';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { DecisionMeetingDto } from '../../alcs/meetings/decision-meeting.dto';

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
              LocalGovernment,
              LocalGovernmentDto,
            ),
          ),
        ),
        forMember(
          (a) => a.decisionMeetings,
          mapFrom((a) =>
            this.mapper.mapArray(
              a.decisionMeetings,
              ApplicationDecisionMeeting,
              DecisionMeetingDto,
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
          (a) => a.reviewOutcome,
          mapFrom((rd) =>
            rd.reviewOutcome
              ? this.mapper.map(
                  rd.reviewOutcome,
                  ApplicationModificationOutcomeType,
                  ApplicationModificationOutcomeCodeDto,
                )
              : null,
          ),
        ),
        forMember(
          (a) => a.modifiesDecisions,
          mapFrom((rd) =>
            rd.modifiesDecisions
              ? this.mapper.mapArray(
                  rd.modifiesDecisions,
                  ApplicationDecision,
                  ApplicationDecisionDto,
                )
              : [],
          ),
        ),
        forMember(
          (a) => a.resultingDecision,
          mapFrom((rd) =>
            rd.resultingDecision
              ? this.mapper.map(
                  rd.resultingDecision,
                  ApplicationDecision,
                  ApplicationDecisionDto,
                )
              : null,
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

import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CardDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';
import {
  ApplicationModificationDto,
  ApplicationForModificationDto,
} from '../../decision/application-modification/application-modification.dto';
import { ApplicationModification } from '../../decision/application-modification/application-modification.entity';
import { ApplicationLocalGovernmentDto } from '../../application/application-code/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernment } from '../../application/application-code/application-local-government/application-local-government.entity';
import { ApplicationDecisionMeetingDto } from '../../decision/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../decision/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionDto } from '../../decision/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../decision/application-decision/application-decision.entity';
import { Application } from '../../application/application.entity';

@Injectable()
export class ModificationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
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
          mapFrom((rd) =>
            rd.reviewDate ? rd.reviewDate.getTime() : undefined,
          ),
        ),
        forMember(
          (a) => a.isReviewApproved,
          mapFrom((rd) => rd.isReviewApproved),
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

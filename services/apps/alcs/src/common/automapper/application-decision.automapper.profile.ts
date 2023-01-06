import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationDecisionMeetingDto } from '../../decision/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../decision/application-decision-meeting/application-decision-meeting.entity';
import { DecisionOutcomeCode } from '../../decision/application-decision/application-decision-outcome.entity';
import {
  ApplicationDecisionDto,
  ChairReviewOutcomeCodeDto,
  DecisionDocumentDto,
  DecisionOutcomeCodeDto,
} from '../../decision/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../decision/application-decision/application-decision.entity';
import { CeoCriterionCodeDto } from '../../decision/application-decision/ceo-criterion/ceo-criterion.dto';
import { CeoCriterionCode } from '../../decision/application-decision/ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from '../../decision/application-decision/decision-document.entity';
import { DecisionMakerCodeDto } from '../../decision/application-decision/decision-maker/decision-maker.dto';
import { DecisionMakerCode } from '../../decision/application-decision/decision-maker/decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from '../../decision/application-decision/decision-outcome-type/application-decision-outcome-type.entity';

@Injectable()
export class ApplicationDecisionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ApplicationDecision,
        ApplicationDecisionDto,
        forMember(
          (ad) => ad.documents,
          mapFrom((a) =>
            this.mapper.mapArray(
              a.documents || [],
              DecisionDocument,
              DecisionDocumentDto,
            ),
          ),
        ),
        forMember(
          (a) => a.reconsiders,
          mapFrom((dec) =>
            dec.reconsiders
              ? {
                  uuid: dec.reconsiders.uuid,
                  linkedResolutions: dec.reconsiders.reconsidersDecisions.map(
                    (decision) =>
                      `#${decision.resolutionNumber}/${dec.resolutionYear}`,
                  ),
                }
              : undefined,
          ),
        ),
        forMember(
          (a) => a.modifies,
          mapFrom((dec) =>
            dec.modifies
              ? {
                  uuid: dec.modifies.uuid,
                  linkedResolutions: dec.modifies.modifiesDecisions.map(
                    (decision) =>
                      `#${decision.resolutionNumber}/${dec.resolutionYear}`,
                  ),
                }
              : undefined,
          ),
        ),
        forMember(
          (a) => a.reconsideredBy,
          mapFrom((dec) =>
            (dec.reconsideredBy || [])
              .filter((reconsideration) => reconsideration.resultingDecision)
              .map((reconsideration) => ({
                uuid: reconsideration.uuid,
                linkedResolutions: [
                  `#${reconsideration.resultingDecision!.resolutionNumber}/${
                    reconsideration.resultingDecision!.resolutionYear
                  }`,
                ],
              })),
          ),
        ),
        forMember(
          (a) => a.modifiedBy,
          mapFrom((dec) =>
            (dec.modifiedBy || [])
              .filter((modification) => modification.resultingDecision)
              .map((modification) => ({
                uuid: modification.uuid,
                linkedResolutions: [
                  `#${modification.resultingDecision!.resolutionNumber}/${
                    modification.resultingDecision!.resolutionYear
                  }`,
                ],
              })),
          ),
        ),
        forMember(
          (ad) => ad.decisionMaker,
          mapFrom((a) =>
            this.mapper.map(
              a.decisionMaker,
              DecisionMakerCode,
              DecisionMakerCodeDto,
            ),
          ),
        ),
        forMember(
          (ad) => ad.ceoCriterion,
          mapFrom((a) =>
            this.mapper.map(
              a.ceoCriterion,
              CeoCriterionCode,
              CeoCriterionCodeDto,
            ),
          ),
        ),
        forMember(
          (ad) => ad.chairReviewOutcome,
          mapFrom((a) =>
            this.mapper.map(
              a.chairReviewOutcome,
              ApplicationDecisionChairReviewOutcomeType,
              ChairReviewOutcomeCodeDto,
            ),
          ),
        ),
        forMember(
          (ad) => ad.date,
          mapFrom((a) => a.date.getTime()),
        ),
        forMember(
          (ad) => ad.auditDate,
          mapFrom((a) => a.auditDate?.getTime()),
        ),
        forMember(
          (ad) => ad.chairReviewDate,
          mapFrom((a) => a.chairReviewDate?.getTime()),
        ),
      );

      createMap(mapper, DecisionOutcomeCode, DecisionOutcomeCodeDto);
      createMap(mapper, DecisionMakerCode, DecisionMakerCodeDto);
      createMap(mapper, CeoCriterionCode, CeoCriterionCodeDto);
      createMap(
        mapper,
        ApplicationDecisionChairReviewOutcomeType,
        ChairReviewOutcomeCodeDto,
      );

      createMap(
        mapper,
        ApplicationDecisionMeeting,
        ApplicationDecisionMeetingDto,
      );
      createMap(
        mapper,
        ApplicationDecisionMeetingDto,
        ApplicationDecisionMeeting,
        forMember(
          (a) => a.date,
          mapFrom((ad) => new Date(ad.date)),
        ),
      );

      createMap(
        mapper,
        DecisionDocument,
        DecisionDocumentDto,
        forMember(
          (a) => a.mimeType,
          mapFrom((ad) => ad.document.mimeType),
        ),
        forMember(
          (a) => a.fileName,
          mapFrom((ad) => ad.document.fileName),
        ),
        forMember(
          (a) => a.uploadedBy,
          mapFrom((ad) => ad.document.uploadedBy?.name),
        ),
        forMember(
          (a) => a.uploadedAt,
          mapFrom((ad) => ad.document.uploadedAt.getTime()),
        ),
      );
    };
  }
}

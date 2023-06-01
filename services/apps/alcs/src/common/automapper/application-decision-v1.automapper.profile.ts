import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationCeoCriterionCode } from '../../alcs/application-decision/application-ceo-criterion/application-ceo-criterion.entity';

import { ApplicationDecisionOutcomeCode } from '../../alcs/application-decision/application-decision-outcome.entity';
import { ApplicationDecision } from '../../alcs/application-decision/application-decision.entity';
import { ApplicationDecisionDocument } from '../../alcs/application-decision/application-decision-document/application-decision-document.entity';
import { ApplicationDecisionMakerCode } from '../../alcs/application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from '../../alcs/application-decision/application-decision-outcome-type/application-decision-outcome-type.entity';
import { ApplicationDecisionMeetingDto } from '../../alcs/application-decision/application-decision-v1/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../alcs/application-decision/application-decision-v1/application-decision-meeting/application-decision-meeting.entity';
import {
  ApplicationDecisionDto,
  ChairReviewOutcomeCodeDto,
  DecisionDocumentDto,
  DecisionOutcomeCodeDto,
} from '../../alcs/application-decision/application-decision-v1/application-decision/application-decision.dto';
import { CeoCriterionCodeDto } from '../../alcs/application-decision/application-decision-v1/application-decision/ceo-criterion/ceo-criterion.dto';
import { DecisionMakerCodeDto } from '../../alcs/application-decision/application-decision-v1/application-decision/decision-maker/decision-maker.dto';

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
              ApplicationDecisionDocument,
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
                      `#${decision.resolutionNumber}/${decision.resolutionYear}`,
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
                      `#${decision.resolutionNumber}/${decision.resolutionYear}`,
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
              ApplicationDecisionMakerCode,
              DecisionMakerCodeDto,
            ),
          ),
        ),
        forMember(
          (ad) => ad.ceoCriterion,
          mapFrom((a) =>
            this.mapper.map(
              a.ceoCriterion,
              ApplicationCeoCriterionCode,
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

      createMap(mapper, ApplicationDecisionOutcomeCode, DecisionOutcomeCodeDto);
      createMap(mapper, ApplicationDecisionMakerCode, DecisionMakerCodeDto);
      createMap(mapper, ApplicationCeoCriterionCode, CeoCriterionCodeDto);
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
        ApplicationDecisionDocument,
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

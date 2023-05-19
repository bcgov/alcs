import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { DecisionOutcomeCode } from '../../alcs/decision/application-decision-outcome.entity';
import { ApplicationDecision } from '../../alcs/decision/application-decision.entity';
import { CeoCriterionCode } from '../../alcs/decision/ceo-criterion/ceo-criterion.entity';
import { ApplicationDecisionConditionType } from '../../alcs/decision/decision-condition/decision-condition-code.entity';
import {
  ApplicationDecisionConditionDto,
  ApplicationDecisionConditionTypeDto,
} from '../../alcs/decision/decision-condition/decision-condition.dto';
import { ApplicationDecisionCondition } from '../../alcs/decision/decision-condition/decision-condition.entity';
import { DecisionDocument } from '../../alcs/decision/decision-document/decision-document.entity';
import { DecisionMakerCode } from '../../alcs/decision/decision-maker/decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from '../../alcs/decision/decision-outcome-type/application-decision-outcome-type.entity';
import {
  ApplicationDecisionDto,
  ChairReviewOutcomeCodeDto,
  DecisionDocumentDto,
  DecisionOutcomeCodeDto,
} from '../../alcs/decision/decision-v2/application-decision/application-decision.dto';
import { CeoCriterionCodeDto } from '../../alcs/decision/decision-v2/application-decision/ceo-criterion/ceo-criterion.dto';
import { ApplicationDecisionComponentType } from '../../alcs/decision/decision-v2/application-decision/component/application-decision-component-type.entity';
import {
  ApplicationDecisionComponentDto,
  ApplicationDecisionComponentTypeDto,
} from '../../alcs/decision/decision-v2/application-decision/component/application-decision-component.dto';
import { ApplicationDecisionComponent } from '../../alcs/decision/decision-v2/application-decision/component/application-decision-component.entity';
import { DecisionMakerCodeDto } from '../../alcs/decision/decision-v2/application-decision/decision-maker/decision-maker.dto';
import { PortalDecisionDto } from '../../portal/application-decision/application-decision.dto';

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
        forMember(
          (ad) => ad.rescindedDate,
          mapFrom((a) => a.rescindedDate?.getTime()),
        ),
        forMember(
          (a) => a.components,
          mapFrom((ad) => {
            if (ad.components) {
              return this.mapper.mapArray(
                ad.components,
                ApplicationDecisionComponent,
                ApplicationDecisionComponentDto,
              );
            } else {
              return [];
            }
          }),
        ),
      );
      // applicationDecisionComponentType

      createMap(mapper, DecisionOutcomeCode, DecisionOutcomeCodeDto);
      createMap(
        mapper,
        ApplicationDecisionComponent,
        ApplicationDecisionComponentDto,
        forMember(
          (ad) => ad.nfuEndDate,
          mapFrom((a) => a.nfuEndDate?.getTime()),
        ),
      );
      createMap(mapper, DecisionMakerCode, DecisionMakerCodeDto);
      createMap(mapper, CeoCriterionCode, CeoCriterionCodeDto);
      createMap(
        mapper,
        ApplicationDecisionComponentType,
        ApplicationDecisionComponentTypeDto,
      );
      createMap(
        mapper,
        ApplicationDecisionChairReviewOutcomeType,
        ChairReviewOutcomeCodeDto,
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

      createMap(
        mapper,
        ApplicationDecisionCondition,
        ApplicationDecisionConditionDto,
      );

      createMap(
        mapper,
        ApplicationDecisionConditionType,
        ApplicationDecisionConditionTypeDto,
      );

      createMap(
        mapper,
        ApplicationDecision,
        PortalDecisionDto,
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
      );
    };
  }
}

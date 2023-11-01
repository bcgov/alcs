import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationCeoCriterionCode } from '../../alcs/application-decision/application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionConditionType } from '../../alcs/application-decision/application-decision-condition/application-decision-condition-code.entity';
import {
  ApplicationDecisionConditionComponentDto,
  ApplicationDecisionConditionDto,
  ApplicationDecisionConditionTypeDto,
} from '../../alcs/application-decision/application-decision-condition/application-decision-condition.dto';
import { ApplicationDecisionCondition } from '../../alcs/application-decision/application-decision-condition/application-decision-condition.entity';
import { ApplicationDecisionDocument } from '../../alcs/application-decision/application-decision-document/application-decision-document.entity';
import { ApplicationDecisionMakerCode } from '../../alcs/application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionChairReviewOutcomeType } from '../../alcs/application-decision/application-decision-outcome-type/application-decision-outcome-type.entity';

import { ApplicationDecisionComponentLotDto } from '../../alcs/application-decision/application-component-lot/application-decision-component-lot.dto';
import { ApplicationDecisionComponentLot } from '../../alcs/application-decision/application-component-lot/application-decision-component-lot.entity';
import { ApplicationDecisionMakerCodeDto } from '../../alcs/application-decision/application-decision-maker/decision-maker.dto';
import { ApplicationDecisionOutcomeCode } from '../../alcs/application-decision/application-decision-outcome.entity';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutcomeCodeDto,
  ChairReviewOutcomeCodeDto,
  DecisionDocumentDto,
} from '../../alcs/application-decision/application-decision-v2/application-decision/application-decision.dto';
import { CeoCriterionCodeDto } from '../../alcs/application-decision/application-decision-v2/application-decision/ceo-criterion/ceo-criterion.dto';
import { ApplicationDecisionComponentType } from '../../alcs/application-decision/application-decision-v2/application-decision/component/application-decision-component-type.entity';
import {
  ApplicationDecisionComponentDto,
  ApplicationDecisionComponentTypeDto,
} from '../../alcs/application-decision/application-decision-v2/application-decision/component/application-decision-component.dto';
import { ApplicationDecisionComponent } from '../../alcs/application-decision/application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecision } from '../../alcs/application-decision/application-decision.entity';
import { ApplicationPortalDecisionDto } from '../../portal/public/application/application-decision.dto';
import { NaruSubtypeDto } from '../../portal/application-submission/application-submission.dto';
import { NaruSubtype } from '../../portal/application-submission/naru-subtype/naru-subtype.entity';
import { ApplicationDecisionConditionToComponentLotDto } from '../../alcs/application-decision/application-condition-to-component-lot/application-condition-to-component-lot.controller.dto';
import { ApplicationDecisionConditionToComponentLot } from '../../alcs/application-decision/application-condition-to-component-lot/application-decision-condition-to-component-lot.entity';
import { ApplicationDecisionConditionComponentPlanNumber } from '../../alcs/application-decision/application-decision-component-to-condition/application-decision-component-to-condition-plan-number.entity';

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
          (ad) => ad.date,
          mapFrom((a) => a.date?.getTime()),
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

      createMap(
        mapper,
        ApplicationDecisionOutcomeCode,
        ApplicationDecisionOutcomeCodeDto,
      );

      createMap(mapper, NaruSubtype, NaruSubtypeDto);
      createMap(
        mapper,
        ApplicationDecisionComponent,
        ApplicationDecisionComponentDto,
        forMember(
          (ad) => ad.endDate,
          mapFrom((a) => a.endDate?.getTime()),
        ),
        forMember(
          (ad) => ad.expiryDate,
          mapFrom((a) => a.expiryDate?.getTime()),
        ),
        forMember(
          (ad) => ad.naruSubtype,
          mapFrom((a) =>
            this.mapper.map(a.naruSubtype, NaruSubtype, NaruSubtypeDto),
          ),
        ),
        forMember(
          (ad) => ad.lots,
          mapFrom((a) =>
            a.lots
              ? this.mapper.mapArray(
                  a.lots,
                  ApplicationDecisionComponentLot,
                  ApplicationDecisionComponentLotDto,
                )
              : [],
          ),
        ),
      );
      createMap(
        mapper,
        ApplicationDecisionMakerCode,
        ApplicationDecisionMakerCodeDto,
      );
      createMap(mapper, ApplicationCeoCriterionCode, CeoCriterionCodeDto);
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
          (a) => a.fileSize,
          mapFrom((ad) => ad.document.fileSize),
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
        forMember(
          (ad) => ad.completionDate,
          mapFrom((a) => a.completionDate?.getTime()),
        ),
        forMember(
          (ad) => ad.supersededDate,
          mapFrom((a) => a.supersededDate?.getTime()),
        ),
        forMember(
          (ad) => ad.components,
          mapFrom((a) =>
            a.components && a.components.length > 0
              ? this.mapper.mapArray(
                  a.components,
                  ApplicationDecisionComponent,
                  ApplicationDecisionComponentDto,
                )
              : [],
          ),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionConditionType,
        ApplicationDecisionConditionTypeDto,
      );

      createMap(
        mapper,
        ApplicationDecision,
        ApplicationPortalDecisionDto,
        forMember(
          (ad) => ad.date,
          mapFrom((a) => a.date?.getTime()),
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
      );

      createMap(
        mapper,
        ApplicationDecisionComponentLot,
        ApplicationDecisionComponentLotDto,
        forMember(
          (a) => a.type,
          mapFrom((ac) => ac.type),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionConditionToComponentLot,
        ApplicationDecisionConditionToComponentLotDto,
      );

      createMap(
        mapper,
        ApplicationDecisionConditionComponentPlanNumber,
        ApplicationDecisionConditionComponentDto,
      );
    };
  }
}

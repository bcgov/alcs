import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationBoundaryAmendmentDto } from '../../alcs/application-decision/application-boundary-amendment/application-boundary-amendment.dto';
import { ApplicationBoundaryAmendment } from '../../alcs/application-decision/application-boundary-amendment/application-boundary-amendment.entity';
import { ApplicationCeoCriterionCode } from '../../alcs/application-decision/application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionConditionType } from '../../alcs/application-decision/application-decision-condition/application-decision-condition-code.entity';
import {
  ApplicationDecisionConditionComponentDto,
  ApplicationDecisionConditionDto,
  ApplicationDecisionConditionHomeDto,
  ApplicationDecisionConditionTypeDto,
  ApplicationDecisionHomeDto,
  ApplicationHomeDto,
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
import { CommissionerDecisionDto } from '../../alcs/commissioner/commissioner.dto';
import { ApplicationDecisionConditionDate } from '../../alcs/application-decision/application-decision-condition/application-decision-condition-date/application-decision-condition-date.entity';
import { ApplicationDecisionConditionDateDto } from '../../alcs/application-decision/application-decision-condition/application-decision-condition-date/application-decision-condition-date.dto';
import { ApplicationDecisionConditionCard } from '../../alcs/application-decision/application-decision-condition/application-decision-condition-card/application-decision-condition-card.entity';
import {
  ApplicationDecisionConditionCardBoardDto,
  ApplicationDecisionConditionCardDto,
  ApplicationDecisionConditionCardUuidDto,
  ApplicationDecisionConditionHomeCardDto,
} from '../../alcs/application-decision/application-decision-condition/application-decision-condition-card/application-decision-condition-card.dto';
import { UserDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';
import { Application } from '../../alcs/application/application.entity';

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
          mapFrom((a) => this.mapper.mapArray(a.documents || [], ApplicationDecisionDocument, DecisionDocumentDto)),
        ),
        forMember(
          (a) => a.reconsiders,
          mapFrom((dec) =>
            dec.reconsiders
              ? {
                  uuid: dec.reconsiders.uuid,
                  linkedResolutions: dec.reconsiders.reconsidersDecisions.map(
                    (decision) => `#${decision.resolutionNumber}/${decision.resolutionYear}`,
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
                    (decision) => `#${decision.resolutionNumber}/${decision.resolutionYear}`,
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
              return this.mapper.mapArray(ad.components, ApplicationDecisionComponent, ApplicationDecisionComponentDto);
            } else {
              return [];
            }
          }),
        ),
        forMember(
          (dto) => dto.conditionCards,
          mapFrom((entity) =>
            entity.conditionCards
              ? this.mapper.mapArray(
                  entity.conditionCards,
                  ApplicationDecisionConditionCard,
                  ApplicationDecisionConditionCardUuidDto,
                )
              : [],
          ),
        ),
        forMember(
          (ad) => ad.followUpAt,
          mapFrom((a) => a.followUpAt?.getTime()),
        ),
        forMember(
          (ad) => ad.flaggedBy,
          mapFrom((a) => (a.flaggedBy ? this.mapper.map(a.flaggedBy, User, UserDto) : a.flaggedBy)),
        ),
        forMember(
          (ad) => ad.flagEditedBy,
          mapFrom((a) => (a.flagEditedBy ? this.mapper.map(a.flagEditedBy, User, UserDto) : a.flagEditedBy)),
        ),
        forMember(
          (ad) => ad.flagEditedAt,
          mapFrom((a) => a.flagEditedAt?.getTime()),
        ),
      );

      createMap(mapper, ApplicationDecisionOutcomeCode, ApplicationDecisionOutcomeCodeDto);

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
          (ad) => ad.endDate2,
          mapFrom((a) => a.endDate2?.getTime()),
        ),
        forMember(
          (ad) => ad.expiryDate,
          mapFrom((a) => a.expiryDate?.getTime()),
        ),
        forMember(
          (ad) => ad.naruSubtype,
          mapFrom((a) => this.mapper.map(a.naruSubtype, NaruSubtype, NaruSubtypeDto)),
        ),
        forMember(
          (ad) => ad.lots,
          mapFrom((a) =>
            a.lots
              ? this.mapper.mapArray(a.lots, ApplicationDecisionComponentLot, ApplicationDecisionComponentLotDto)
              : [],
          ),
        ),
      );
      createMap(mapper, ApplicationDecisionMakerCode, ApplicationDecisionMakerCodeDto);
      createMap(mapper, ApplicationCeoCriterionCode, CeoCriterionCodeDto);
      createMap(mapper, ApplicationDecisionComponentType, ApplicationDecisionComponentTypeDto);
      createMap(mapper, ApplicationDecisionChairReviewOutcomeType, ChairReviewOutcomeCodeDto);

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
          (ad) => ad.components,
          mapFrom((a) =>
            a.components && a.components.length > 0
              ? this.mapper.mapArray(a.components, ApplicationDecisionComponent, ApplicationDecisionComponentDto)
              : [],
          ),
        ),
        forMember(
          (dto) => dto.dates,
          mapFrom((entity) =>
            entity.dates
              ? this.mapper.mapArray(
                  entity.dates,
                  ApplicationDecisionConditionDate,
                  ApplicationDecisionConditionDateDto,
                )
              : [],
          ),
        ),
        forMember(
          (dto) => dto.conditionCard,
          mapFrom((entity) =>
            entity.conditionCard
              ? this.mapper.map(
                  entity.conditionCard,
                  ApplicationDecisionConditionCard,
                  ApplicationDecisionConditionCardUuidDto,
                )
              : null,
          ),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionCondition,
        ApplicationDecisionConditionHomeDto,
        forMember(
          (dto) => dto.conditionCard,
          mapFrom((entity) =>
            entity.conditionCard
              ? this.mapper.map(
                  entity.conditionCard,
                  ApplicationDecisionConditionCard,
                  ApplicationDecisionConditionHomeCardDto,
                )
              : null,
          ),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionConditionDate,
        ApplicationDecisionConditionDateDto,
        forMember(
          (dto) => dto.date,
          mapFrom((entity) => entity.date && entity.date.getTime()),
        ),
        forMember(
          (dto) => dto.completedDate,
          mapFrom((entity) => entity.completedDate && entity.completedDate.getTime()),
        ),
        forMember(
          (dto) => dto.comment,
          mapFrom((entity) => entity.comment),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionConditionType,
        ApplicationDecisionConditionTypeDto,
        forMember(
          (dto) => dto.isAdministrativeFeeAmountRequired,
          mapFrom((entity) =>
            entity.isAdministrativeFeeAmountRequired !== null ? entity.isAdministrativeFeeAmountRequired : null,
          ),
        ),
        forMember(
          (dto) => dto.administrativeFeeAmount,
          mapFrom((entity) => (entity.administrativeFeeAmount !== null ? entity.administrativeFeeAmount : null)),
        ),
        forMember(
          (dto) => dto.isDateRequired,
          mapFrom((entity) => (entity.isDateRequired !== null ? entity.isDateRequired : null)),
        ),
        forMember(
          (dto) => dto.dateType,
          mapFrom((entity) => (entity.dateType !== null ? entity.dateType : null)),
        ),
        forMember(
          (dto) => dto.singleDateLabel,
          mapFrom((entity) => (entity.singleDateLabel !== null ? entity.singleDateLabel : null)),
        ),
        forMember(
          (dto) => dto.isSecurityAmountRequired,
          mapFrom((entity) => (entity.isSecurityAmountRequired !== null ? entity.isSecurityAmountRequired : null)),
        ),
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
                    (decision) => `#${decision.resolutionNumber}/${decision.resolutionYear}`,
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
                    (decision) => `#${decision.resolutionNumber}/${decision.resolutionYear}`,
                  ),
                }
              : undefined,
          ),
        ),
      );

      createMap(
        mapper,
        ApplicationDecision,
        CommissionerDecisionDto,
        forMember(
          (ad) => ad.date,
          mapFrom((a) => a.date?.getTime()),
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

      createMap(mapper, ApplicationDecisionConditionToComponentLot, ApplicationDecisionConditionToComponentLotDto);

      createMap(mapper, ApplicationDecisionConditionComponentPlanNumber, ApplicationDecisionConditionComponentDto);

      createMap(
        mapper,
        ApplicationBoundaryAmendment,
        ApplicationBoundaryAmendmentDto,
        forMember(
          (dto) => dto.decisionComponents,
          mapFrom((entity) =>
            entity.decisionComponents.map((decisionComponent) => ({
              label: `${
                decisionComponent.applicationDecision.resolutionNumber
                  ? `#${decisionComponent.applicationDecision.resolutionNumber}/${decisionComponent.applicationDecision.resolutionYear}`
                  : `Draft`
              } ${decisionComponent.applicationDecisionComponentType.label}`,
              uuid: decisionComponent.uuid,
            })),
          ),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionConditionCard,
        ApplicationDecisionConditionCardDto,
        forMember(
          (dto) => dto.conditions,
          mapFrom((entity) =>
            entity.conditions
              ? this.mapper.mapArray(entity.conditions, ApplicationDecisionCondition, ApplicationDecisionConditionDto)
              : [],
          ),
        ),
        forMember(
          (dto) => dto.decisionUuid,
          mapFrom((entity) => (entity.decision.uuid ? entity.decision.uuid : undefined)),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionConditionCard,
        ApplicationDecisionConditionCardBoardDto,
        forMember(
          (dto) => dto.conditions,
          mapFrom((entity) =>
            entity.conditions
              ? this.mapper.mapArray(entity.conditions, ApplicationDecisionCondition, ApplicationDecisionConditionDto)
              : [],
          ),
        ),
        forMember(
          (dto) => dto.decisionUuid,
          mapFrom((entity) => entity.decision.uuid),
        ),
        forMember(
          (dto) => dto.decisionIsFlagged,
          mapFrom((entity) => entity.decision.isFlagged),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionConditionCard,
        ApplicationDecisionConditionCardUuidDto,
        forMember(
          (dto) => dto.uuid,
          mapFrom((entity) => entity.uuid),
        ),
      );

      createMap(
        mapper,
        ApplicationDecisionConditionCard,
        ApplicationDecisionConditionHomeCardDto,
        forMember(
          (dto) => dto.uuid,
          mapFrom((entity) => entity.uuid),
        ),
      );

      createMap(mapper, ApplicationDecision, ApplicationDecisionHomeDto);

      createMap(mapper, Application, ApplicationHomeDto);
    };
  }
}

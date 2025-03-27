import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Injectable } from '@nestjs/common';
import { CardDto } from '../../alcs/card/card.dto';
import { Card } from '../../alcs/card/card.entity';
import { LocalGovernmentDto } from '../../alcs/local-government/local-government.dto';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { NoticeOfIntentDecisionComponentType } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-component/notice-of-intent-decision-component-type.entity';
import {
  NoticeOfIntentDecisionComponentDto,
  NoticeOfIntentDecisionComponentTypeDto,
} from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-component/notice-of-intent-decision-component.dto';
import { NoticeOfIntentDecisionComponent } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-component/notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecisionConditionType } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import {
  NoticeOfIntentDecisionConditionDto,
  NoticeOfIntentDecisionConditionHomeDto,
  NoticeOfIntentDecisionConditionTypeDto,
  NoticeOfIntentDecisionHomeDto,
  NoticeOfIntentHomeDto,
} from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition.dto';
import { NoticeOfIntentDecisionCondition } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionDocument } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-outcome.entity';
import {
  NoticeOfIntentDecisionDocumentDto,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeCodeDto,
} from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecision } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentModificationOutcomeType } from '../../alcs/notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification-outcome-type/notice-of-intent-modification-outcome-type.entity';
import {
  NoticeOfIntentForModificationDto,
  NoticeOfIntentModificationDto,
  NoticeOfIntentModificationOutcomeCodeDto,
} from '../../alcs/notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModification } from '../../alcs/notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.entity';
import { NoticeOfIntentSubmissionStatusType } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NoticeOfIntentStatusDto } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentPortalDecisionDto } from '../../portal/public/notice-of-intent/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionConditionDate } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-date/notice-of-intent-decision-condition-date.entity';
import { NoticeOfIntentDecisionConditionDateDto } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-date/notice-of-intent-decision-condition-date.dto';
import { User } from '../../user/user.entity';
import { UserDto } from '../../user/user.dto';
import { NoticeOfIntentDecisionConditionCard } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.entity';
import {
  NoticeOfIntentDecisionConditionCardBoardDto,
  NoticeOfIntentDecisionConditionCardDto,
  NoticeOfIntentDecisionConditionCardUuidDto,
  NoticeOfIntentDecisionConditionHomeCardDto,
} from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.dto';
import {
  InstrumentStatus,
  NoticeOfIntentDecisionConditionFinancialInstrument,
} from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.entity';
import { NoticeOfIntentDecisionConditionFinancialInstrumentDto } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.dto';

@Injectable()
export class NoticeOfIntentDecisionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        NoticeOfIntentDecision,
        NoticeOfIntentDecisionDto,
        forMember(
          (ad) => ad.documents,
          mapFrom((a) =>
            this.mapper.mapArray(a.documents || [], NoticeOfIntentDecisionDocument, NoticeOfIntentDecisionDocumentDto),
          ),
        ),
        forMember(
          (ad) => ad.date,
          mapFrom((a) => a.date?.getTime()),
        ),
        forMember(
          (ad) => ad.createdAt,
          mapFrom((a) => a.createdAt?.getTime()),
        ),
        forMember(
          (ad) => ad.auditDate,
          mapFrom((a) => a.auditDate?.getTime()),
        ),
        forMember(
          (ad) => ad.rescindedDate,
          mapFrom((a) => a.rescindedDate?.getTime()),
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
          (a) => a.components,
          mapFrom((ad) => {
            if (ad.components) {
              return this.mapper.mapArray(
                ad.components,
                NoticeOfIntentDecisionComponent,
                NoticeOfIntentDecisionComponentDto,
              );
            } else {
              return [];
            }
          }),
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
        forMember(
          (dto) => dto.conditionCards,
          mapFrom((entity) =>
            entity.conditionCards
              ? this.mapper.mapArray(
                  entity.conditionCards,
                  NoticeOfIntentDecisionConditionCard,
                  NoticeOfIntentDecisionConditionCardUuidDto,
                )
              : [],
          ),
        ),
        forMember(
          (ad) => ad.canDraftBeDeleted,
          mapFrom((a) => a.modifiedBy?.length <= 0),
        ),
      );

      createMap(mapper, NoticeOfIntentSubmissionStatusType, NoticeOfIntentStatusDto);

      createMap(mapper, NoticeOfIntentDecisionComponent, NoticeOfIntentDecisionComponentDto);

      createMap(mapper, NoticeOfIntentDecisionComponentType, NoticeOfIntentDecisionComponentTypeDto);

      createMap(
        mapper,
        NoticeOfIntentDecisionCondition,
        NoticeOfIntentDecisionConditionDto,
        forMember(
          (ad) => ad.components,
          mapFrom((a) =>
            a.components && a.components.length > 0
              ? this.mapper.mapArray(a.components, NoticeOfIntentDecisionComponent, NoticeOfIntentDecisionComponentDto)
              : [],
          ),
        ),
        forMember(
          (dto) => dto.dates,
          mapFrom((entity) =>
            entity.dates
              ? this.mapper.mapArray(
                  entity.dates,
                  NoticeOfIntentDecisionConditionDate,
                  NoticeOfIntentDecisionConditionDateDto,
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
                  NoticeOfIntentDecisionConditionCard,
                  NoticeOfIntentDecisionConditionCardUuidDto,
                )
              : null,
          ),
        ),

        forMember(
          (dto) => dto.financialInstruments,
          mapFrom((entity) =>
            entity.financialInstruments
              ? this.mapper.mapArray(
                  entity.financialInstruments,
                  NoticeOfIntentDecisionConditionFinancialInstrument,
                  NoticeOfIntentDecisionConditionFinancialInstrumentDto,
                )
              : [],
          ),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionConditionDate,
        NoticeOfIntentDecisionConditionDateDto,
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
        NoticeOfIntentDecisionConditionType,
        NoticeOfIntentDecisionConditionTypeDto,
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

      createMap(mapper, NoticeOfIntentDecisionOutcome, NoticeOfIntentDecisionOutcomeCodeDto);

      createMap(
        mapper,
        NoticeOfIntentDecisionDocument,
        NoticeOfIntentDecisionDocumentDto,
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

      createMap(mapper, NoticeOfIntentModificationOutcomeType, NoticeOfIntentModificationOutcomeCodeDto);

      createMap(
        mapper,
        NoticeOfIntent,
        NoticeOfIntentForModificationDto,
        forMember(
          (a) => a.localGovernment,
          mapFrom((a) => this.mapper.map(a.localGovernment, LocalGovernment, LocalGovernmentDto)),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentModification,
        NoticeOfIntentModificationDto,
        forMember(
          (a) => a.noticeOfIntent,
          mapFrom((rd) => this.mapper.map(rd.noticeOfIntent, NoticeOfIntent, NoticeOfIntentForModificationDto)),
        ),
        forMember(
          (a) => a.submittedDate,
          mapFrom((rd) => rd.submittedDate.getTime()),
        ),
        forMember(
          (a) => a.modifiesDecisions,
          mapFrom((rd) =>
            rd.modifiesDecisions
              ? this.mapper.mapArray(rd.modifiesDecisions, NoticeOfIntentDecision, NoticeOfIntentDecisionDto)
              : [],
          ),
        ),
        forMember(
          (a) => a.resultingDecision,
          mapFrom((rd) =>
            rd.resultingDecision
              ? this.mapper.map(rd.resultingDecision, NoticeOfIntentDecision, NoticeOfIntentDecisionDto)
              : null,
          ),
        ),
        forMember(
          (a) => a.card,
          mapFrom((rd) => this.mapper.map(rd.card, Card, CardDto)),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentDecision,
        NoticeOfIntentPortalDecisionDto,
        forMember(
          (a) => a.date,
          mapFrom((rd) => rd.date?.getTime()),
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
        NoticeOfIntentDecisionConditionCard,
        NoticeOfIntentDecisionConditionCardDto,
        forMember(
          (dto) => dto.conditions,
          mapFrom((entity) =>
            entity.conditions
              ? this.mapper.mapArray(
                  entity.conditions,
                  NoticeOfIntentDecisionCondition,
                  NoticeOfIntentDecisionConditionDto,
                )
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
        NoticeOfIntentDecisionConditionCard,
        NoticeOfIntentDecisionConditionCardBoardDto,
        forMember(
          (dto) => dto.conditions,
          mapFrom((entity) =>
            entity.conditions
              ? this.mapper.mapArray(
                  entity.conditions,
                  NoticeOfIntentDecisionCondition,
                  NoticeOfIntentDecisionConditionDto,
                )
              : [],
          ),
        ),
        forMember(
          (dto) => dto.decisionUuid,
          mapFrom((entity) => entity.decision.uuid),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionCondition,
        NoticeOfIntentDecisionConditionHomeDto,
        forMember(
          (dto) => dto.conditionCard,
          mapFrom((entity) =>
            entity.conditionCard
              ? this.mapper.map(
                  entity.conditionCard,
                  NoticeOfIntentDecisionConditionCard,
                  NoticeOfIntentDecisionConditionHomeCardDto,
                )
              : null,
          ),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionConditionCard,
        NoticeOfIntentDecisionConditionCardUuidDto,
        forMember(
          (dto) => dto.uuid,
          mapFrom((entity) => entity.uuid),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionConditionCard,
        NoticeOfIntentDecisionConditionHomeCardDto,
        forMember(
          (dto) => dto.uuid,
          mapFrom((entity) => entity.uuid),
        ),
      );

      createMap(mapper, NoticeOfIntentDecision, NoticeOfIntentDecisionHomeDto);

      createMap(
        mapper,
        NoticeOfIntent,
        NoticeOfIntentHomeDto,
        forMember(
          (a) => a.type,
          mapFrom((ac) => ac.type),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionConditionFinancialInstrument,
        NoticeOfIntentDecisionConditionFinancialInstrumentDto,
        forMember(
          (dto) => dto.issueDate,
          mapFrom((entity) => entity.issueDate.getTime()),
        ),
        forMember(
          (dto) => dto.expiryDate,
          mapFrom((entity) => (entity.expiryDate ? entity.expiryDate.getTime() : undefined)),
        ),
        forMember(
          (dto) => dto.receivedDate,
          mapFrom((entity) => entity.receivedDate.getTime()),
        ),
        forMember(
          (dto) => dto.statusDate,
          mapFrom((entity) =>
            entity.status !== InstrumentStatus.RECEIVED ? entity.statusDate?.getTime() || undefined : undefined,
          ),
        ),
        forMember(
          (dto) => dto.explanation,
          mapFrom((entity) => entity.explanation || undefined),
        ),
        forMember(
          (dto) => dto.notes,
          mapFrom((entity) => entity.notes || undefined),
        ),
        forMember(
          (dto) => dto.instrumentNumber,
          mapFrom((entity) => entity.instrumentNumber || undefined),
        ),
      );
    };
  }
}

import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
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
  NoticeOfIntentDecisionConditionTypeDto,
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
            this.mapper.mapArray(
              a.documents || [],
              NoticeOfIntentDecisionDocument,
              NoticeOfIntentDecisionDocumentDto,
            ),
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
                    (decision) =>
                      `#${decision.resolutionNumber}/${decision.resolutionYear}`,
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
      );

      createMap(
        mapper,
        NoticeOfIntentSubmissionStatusType,
        NoticeOfIntentStatusDto,
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionComponent,
        NoticeOfIntentDecisionComponentDto,
        forMember(
          (ad) => ad.endDate,
          mapFrom((a) => a.endDate?.getTime()),
        ),
        forMember(
          (ad) => ad.expiryDate,
          mapFrom((a) => a.expiryDate?.getTime()),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionComponentType,
        NoticeOfIntentDecisionComponentTypeDto,
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionCondition,
        NoticeOfIntentDecisionConditionDto,
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
                  NoticeOfIntentDecisionComponent,
                  NoticeOfIntentDecisionComponentDto,
                )
              : [],
          ),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionConditionType,
        NoticeOfIntentDecisionConditionTypeDto,
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionOutcome,
        NoticeOfIntentDecisionOutcomeCodeDto,
      );

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
        NoticeOfIntentModificationOutcomeType,
        NoticeOfIntentModificationOutcomeCodeDto,
      );

      createMap(
        mapper,
        NoticeOfIntent,
        NoticeOfIntentForModificationDto,
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
      );

      createMap(
        mapper,
        NoticeOfIntentModification,
        NoticeOfIntentModificationDto,
        forMember(
          (a) => a.noticeOfIntent,
          mapFrom((rd) =>
            this.mapper.map(
              rd.noticeOfIntent,
              NoticeOfIntent,
              NoticeOfIntentForModificationDto,
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
          (a) => a.outcomeNotificationDate,
          mapFrom((rd) => rd.outcomeNotificationDate?.getTime()),
        ),
        forMember(
          (a) => a.modifiesDecisions,
          mapFrom((rd) =>
            rd.modifiesDecisions
              ? this.mapper.mapArray(
                  rd.modifiesDecisions,
                  NoticeOfIntentDecision,
                  NoticeOfIntentDecisionDto,
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
                  NoticeOfIntentDecision,
                  NoticeOfIntentDecisionDto,
                )
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

import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationLocalGovernmentDto } from '../../alcs/application/application-code/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { CardDto } from '../../alcs/card/card.dto';
import { Card } from '../../alcs/card/card.entity';
import { NoticeOfIntentDecisionDocument } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-outcome.entity';
import {
  NoticeOfIntentDecisionDocumentDto,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeDto,
} from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecision } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentModificationOutcomeType } from '../../alcs/notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification-outcome-type/notice-of-intent-modification-outcome-type.entity';
import {
  NoticeOfIntentForModificationDto,
  NoticeOfIntentModificationDto,
  NoticeOfIntentModificationOutcomeCodeDto,
} from '../../alcs/notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModification } from '../../alcs/notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.entity';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';

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
          mapFrom((a) => a.date.getTime()),
        ),
        forMember(
          (ad) => ad.auditDate,
          mapFrom((a) => a.auditDate?.getTime()),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentDecisionOutcome,
        NoticeOfIntentDecisionOutcomeDto,
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
              ApplicationLocalGovernment,
              ApplicationLocalGovernmentDto,
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
            this.mapper.mapArray(
              rd.modifiesDecisions,
              NoticeOfIntentDecision,
              NoticeOfIntentDecisionDto,
            ),
          ),
        ),
        forMember(
          (a) => a.resultingDecision,
          mapFrom((rd) =>
            this.mapper.map(
              rd.resultingDecision,
              NoticeOfIntentDecision,
              NoticeOfIntentDecisionDto,
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

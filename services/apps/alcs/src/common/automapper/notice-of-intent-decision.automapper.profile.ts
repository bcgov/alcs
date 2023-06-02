import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NoticeOfIntentDecisionDocument } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision-outcome.entity';
import {
  NoticeOfIntentDecisionDocumentDto,
  NoticeOfIntentDecisionDto,
  NoticeOfIntentDecisionOutcomeDto,
} from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecision } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.entity';

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
    };
  }
}

import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NoticeOfIntentTypeDto } from '../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.dto';
import { NoticeOfIntentType } from '../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
import { NoticeOfIntentDocumentDto } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocument } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.entity';

import { NoticeOfIntentMeetingType } from '../../alcs/notice-of-intent/notice-of-intent-meeting/notice-of-intent-meeting-type.entity';
import {
  NoticeOfIntentMeetingDto,
  NoticeOfIntentMeetingTypeDto,
} from '../../alcs/notice-of-intent/notice-of-intent-meeting/notice-of-intent-meeting.dto';
import { NoticeOfIntentMeeting } from '../../alcs/notice-of-intent/notice-of-intent-meeting/notice-of-intent-meeting.entity';
import { NoticeOfIntentSubtype } from '../../alcs/notice-of-intent/notice-of-intent-subtype.entity';
import {
  NoticeOfIntentDto,
  NoticeOfIntentSubtypeDto,
} from '../../alcs/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentTypeDto } from '../../document/document.dto';

@Injectable()
export class NoticeOfIntentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, NoticeOfIntentSubtype, NoticeOfIntentSubtypeDto);
      createMap(mapper, NoticeOfIntentType, NoticeOfIntentTypeDto);

      createMap(
        mapper,
        NoticeOfIntent,
        NoticeOfIntentDto,
        forMember(
          (a) => a.dateSubmittedToAlc,
          mapFrom((ad) => ad.dateSubmittedToAlc?.getTime()),
        ),
        forMember(
          (a) => a.feePaidDate,
          mapFrom((ad) => ad.feePaidDate?.getTime()),
        ),
        forMember(
          (a) => a.dateAcknowledgedIncomplete,
          mapFrom((ad) => ad.dateAcknowledgedIncomplete?.getTime()),
        ),
        forMember(
          (a) => a.dateReceivedAllItems,
          mapFrom((ad) => ad.dateReceivedAllItems?.getTime()),
        ),
        forMember(
          (a) => a.dateAcknowledgedComplete,
          mapFrom((ad) => ad.dateAcknowledgedComplete?.getTime()),
        ),
        forMember(
          (a) => a.decisionDate,
          mapFrom((ad) => ad.decisionDate?.getTime()),
        ),
        forMember(
          (a) => a.proposalEndDate,
          mapFrom((ad) => ad.proposalEndDate?.getTime()),
        ),
        forMember(
          (a) => a.activeDays,
          mapFrom((_) => 0),
        ),
        forMember(
          (a) => a.pausedDays,
          mapFrom((_) => 0),
        ),
        forMember(
          (a) => a.paused,
          mapFrom((_) => false),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentMeeting,
        NoticeOfIntentMeetingDto,
        forMember(
          (md) => md.meetingType,
          mapFrom((m) => m.type),
        ),
        forMember(
          (md) => md.meetingTypeCode,
          mapFrom((m) => m.type.code),
        ),
        forMember(
          (md) => md.meetingStartDate,
          mapFrom((m) => m.startDate.getTime()),
        ),
        forMember(
          (md) => md.meetingEndDate,
          mapFrom((m) => m.endDate?.getTime()),
        ),
      );

      createMap(
        mapper,
        NoticeOfIntentMeetingType,
        NoticeOfIntentMeetingTypeDto,
      );

      createMap(
        mapper,
        NoticeOfIntentDocument,
        NoticeOfIntentDocumentDto,
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
        forMember(
          (a) => a.documentUuid,
          mapFrom((ad) => ad.document.uuid),
        ),
        forMember(
          (a) => a.source,
          mapFrom((ad) => ad.document.source),
        ),
        forMember(
          (a) => a.system,
          mapFrom((ad) => ad.document.system),
        ),
      );
      createMap(mapper, DocumentCode, DocumentTypeDto);
    };
  }
}

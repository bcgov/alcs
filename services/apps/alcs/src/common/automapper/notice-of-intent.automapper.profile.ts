import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NoticeOfIntentMeetingType } from '../../alcs/notice-of-intent/notice-of-intent-meeting/notice-of-intent-meeting-type.entity';
import {
  NoticeOfIntentMeetingDto,
  NoticeOfIntentMeetingTypeDto,
} from '../../alcs/notice-of-intent/notice-of-intent-meeting/notice-of-intent-meeting.dto';
import { NoticeOfIntentMeeting } from '../../alcs/notice-of-intent/notice-of-intent-meeting/notice-of-intent-meeting.entity';
import { NoticeOfIntentDto } from '../../alcs/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';

@Injectable()
export class NoticeOfIntentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
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
    };
  }
}

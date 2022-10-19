import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationLocalGovernmentDto } from '../../application/application-code/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernment } from '../../application/application-code/application-local-government/application-local-government.entity';

import { ApplicationDecisionMeetingDto } from '../../application/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../application/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDocumentDto } from '../../application/application-document/application-document.dto';
import { ApplicationDocument } from '../../application/application-document/application-document.entity';
import {
  ApplicationMeetingDto,
  CreateApplicationMeetingDto,
} from '../../application/application-meeting/application-meeting.dto';
import { ApplicationMeeting } from '../../application/application-meeting/application-meeting.entity';
import { ApplicationPaused } from '../../application/application-paused.entity';
import { ApplicationDto } from '../../application/application.dto';
import { Application } from '../../application/application.entity';
import { CardDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';
import { ApplicationMeetingTypeDto } from '../../code/application-code/application-meeting-type/application-meeting-type.dto';
import { ApplicationMeetingType } from '../../code/application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationRegionDto } from '../../code/application-code/application-region/application-region.dto';
import { ApplicationRegion } from '../../code/application-code/application-region/application-region.entity';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';
import { ApplicationType } from '../../code/application-code/application-type/application-type.entity';

@Injectable()
export class ApplicationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ApplicationType, ApplicationTypeDto);
      createMap(mapper, ApplicationRegion, ApplicationRegionDto);
      createMap(mapper, ApplicationMeetingType, ApplicationMeetingTypeDto);
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
        ApplicationLocalGovernment,
        ApplicationLocalGovernmentDto,
      );

      createMap(
        mapper,
        Application,
        ApplicationDto,
        forMember(
          (ad) => ad.localGovernment,
          mapFrom((a) =>
            this.mapper.map(
              a.localGovernment,
              ApplicationLocalGovernment,
              ApplicationLocalGovernmentDto,
            ),
          ),
        ),
        forMember(
          (ad) => ad.decisionMeetings,
          mapFrom((a) =>
            this.mapper.mapArray(
              a.decisionMeetings,
              ApplicationDecisionMeeting,
              ApplicationDecisionMeetingDto,
            ),
          ),
        ),
        forMember(
          (ad) => ad.card,
          mapFrom((a) => {
            return this.mapper.map(a.card, Card, CardDto);
          }),
        ),
      );

      createMap(
        mapper,
        ApplicationDocument,
        ApplicationDocumentDto,
        forMember(
          (a) => a.mimeType,
          mapFrom((ad) => {
            return ad.document.mimeType;
          }),
        ),
        forMember(
          (a) => a.fileName,
          mapFrom((ad) => {
            return ad.document.fileName;
          }),
        ),
        forMember(
          (a) => a.uploadedBy,
          mapFrom((ad) => {
            return ad.document.uploadedBy.name;
          }),
        ),
        forMember(
          (a) => a.uploadedAt,
          mapFrom((ad) => {
            return ad.document.uploadedAt.getTime();
          }),
        ),
      );

      createMap(
        mapper,
        ApplicationMeeting,
        ApplicationMeetingDto,
        forMember(
          (ad) => ad.meetingTypeCode,
          mapFrom((a) => a.type.code),
        ),
        forMember(
          (ad) => ad.meetingStartDate,
          mapFrom((a) => a.meetingPause.startDate.valueOf()),
        ),
        forMember(
          (ad) => ad.meetingEndDate,
          mapFrom((a) => a.meetingPause.endDate?.valueOf()),
        ),
        forMember(
          (ad) => ad.reportStartDate,
          mapFrom((a) => a.reportPause?.startDate?.valueOf()),
        ),
        forMember(
          (ad) => ad.reportEndDate,
          mapFrom((a) => a.reportPause?.endDate?.valueOf()),
        ),
        forMember(
          (ad) => ad.meetingType,
          mapFrom((a) =>
            this.mapper.map(
              a.type,
              ApplicationMeetingType,
              ApplicationMeetingTypeDto,
            ),
          ),
        ),
      );

      createMap(
        mapper,
        CreateApplicationMeetingDto,
        ApplicationPaused,
        forMember(
          (a) => a.startDate,
          mapFrom((ad) => this.numberToDateSafe(ad.meetingStartDate)),
        ),
        forMember(
          (a) => a.endDate,
          mapFrom((ad) => this.numberToDateSafe(ad.meetingEndDate)),
        ),
      );

      createMap(mapper, ApplicationDto, Card);
    };
  }

  private numberToDateSafe(date: number | null): Date | null {
    return date ? new Date(date) : null;
  }
}

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
          (a) => a.dateReceived,
          mapFrom((ad) => {
            return ad.dateReceived ? ad.dateReceived.getTime() : undefined;
          }),
        ),
        forMember(
          (a) => a.datePaid,
          mapFrom((ad) => {
            return ad.datePaid ? ad.datePaid.getTime() : undefined;
          }),
        ),
        forMember(
          (a) => a.dateAcknowledgedIncomplete,
          mapFrom((ad) => {
            return ad.dateAcknowledgedIncomplete
              ? ad.dateAcknowledgedIncomplete.getTime()
              : undefined;
          }),
        ),
        forMember(
          (a) => a.dateReceivedAllItems,
          mapFrom((ad) => {
            return ad.dateReceivedAllItems
              ? ad.dateReceivedAllItems.getTime()
              : undefined;
          }),
        ),
        forMember(
          (a) => a.dateAcknowledgedComplete,
          mapFrom((ad) => {
            return ad.dateAcknowledgedComplete
              ? ad.dateAcknowledgedComplete.getTime()
              : undefined;
          }),
        ),
        forMember(
          (a) => a.decisionDate,
          mapFrom((ad) => {
            return ad.decisionDate ? ad.decisionDate.getTime() : undefined;
          }),
        ),
        forMember(
          (a) => a.notificationSentDate,
          mapFrom((ad) => {
            return ad.notificationSentDate
              ? ad.notificationSentDate.getTime()
              : undefined;
          }),
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

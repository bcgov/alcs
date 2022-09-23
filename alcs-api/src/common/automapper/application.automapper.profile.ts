import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ApplicationCodeService } from '../../application/application-code/application-code.service';
import { ApplicationMeetingTypeDto } from '../../application/application-code/application-meeting-type/application-meeting-type.dto';
import { ApplicationMeetingType } from '../../application/application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationRegionDto } from '../../application/application-code/application-region/application-region.dto';
import { ApplicationRegion } from '../../application/application-code/application-region/application-region.entity';
import { ApplicationTypeDto } from '../../application/application-code/application-type/application-type.dto';
import { ApplicationType } from '../../application/application-code/application-type/application-type.entity';
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
import { CardStatusDto } from '../../application/application-status/card-status.dto';
import { CardStatus } from '../../application/application-status/card-status.entity';
import {
  ApplicationDetailedDto,
  ApplicationDto,
} from '../../application/application.dto';
import { Application } from '../../application/application.entity';
import { Card } from '../../card/card.entity';
import { UserDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';

@Injectable()
export class ApplicationProfile extends AutomapperProfile {
  constructor(
    @InjectMapper() mapper: Mapper,
    private codeService: ApplicationCodeService,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, CardStatus, CardStatusDto);
      createMap(mapper, ApplicationType, ApplicationTypeDto);
      createMap(mapper, CardStatusDto, CardStatus);
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
        Application,
        ApplicationDto,
        forMember(
          (ad) => ad.status,
          mapFrom((a) => a.card.status.code),
        ),
        forMember(
          (ad) => ad.type,
          mapFrom((a) => a.type.code),
        ),
        forMember(
          (ad) => ad.board,
          mapFrom((a) => a.card.board.code),
        ),
        forMember(
          (ad) => ad.region,
          mapFrom((a) => (a.region ? a.region.code : undefined)),
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
          (ad) => ad.assignee,
          mapFrom((a) => {
            return this.mapper.map(a.card.assignee, User, UserDto);
          }),
        ),
      );

      createMap(
        mapper,
        Application,
        ApplicationDetailedDto,
        forMember(
          (ad) => ad.statusDetails,
          mapFrom((a) =>
            this.mapper.map(a.card.status, CardStatus, CardStatusDto),
          ),
        ),
        forMember(
          (ad) => ad.typeDetails,
          mapFrom((a) =>
            this.mapper.map(a.type, ApplicationType, ApplicationTypeDto),
          ),
        ),
        forMember(
          (ad) => ad.regionDetails,
          mapFrom((a) =>
            this.mapper.map(a.type, ApplicationRegion, ApplicationRegionDto),
          ),
        ),
      );

      createMap(
        mapper,
        ApplicationDto,
        Application,
        forMember(
          async (a) => a.card.status,
          mapFrom(async (ad) => {
            return await this.codeService.fetchStatus(ad.status);
          }),
        ),
        forMember(
          async (a) => a.type,
          mapFrom(async (ad) => {
            return await this.codeService.fetchType(ad.type);
          }),
        ),
        forMember(
          async (a) => a.region,
          mapFrom(async (ad) =>
            ad.region
              ? await this.codeService.fetchRegion(ad.region)
              : undefined,
          ),
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
          (ad) => ad.startDate,
          mapFrom((a) => a.applicationPaused.startDate.valueOf()),
        ),
        forMember(
          (ad) => ad.endDate,
          mapFrom((a) => a.applicationPaused.endDate?.valueOf()),
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
          (a) => a.endDate,
          mapFrom((ad) => this.numberToDateSafe(ad.endDate)),
        ),
        forMember(
          (a) => a.startDate,
          mapFrom((ad) => this.numberToDateSafe(ad.startDate)),
        ),
      );

      createMap(mapper, ApplicationDto, Card);
    };
  }

  private numberToDateSafe(date: number | null): Date | null {
    return date ? new Date(date) : null;
  }
}

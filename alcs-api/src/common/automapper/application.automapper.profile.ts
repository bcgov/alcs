import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { ApplicationDecisionMeetingDto } from '../../application/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../application/application-decision-meeting/application-decision-meeting.entity';
import {
  ApplicationDecisionDto,
  DecisionDocumentDto,
} from '../../application/application-decision/application-decision.dto';
import { ApplicationDecision } from '../../application/application-decision/application-decision.entity';
import { DecisionDocument } from '../../application/application-decision/decision-document.entity';
import { ApplicationDocumentDto } from '../../application/application-document/application-document.dto';
import { ApplicationDocument } from '../../application/application-document/application-document.entity';
import {
  ApplicationMeetingDto,
  CreateApplicationMeetingDto,
} from '../../application/application-meeting/application-meeting.dto';
import { ApplicationMeeting } from '../../application/application-meeting/application-meeting.entity';
import { ApplicationPaused } from '../../application/application-paused.entity';
import {
  ApplicationDetailedDto,
  ApplicationDto,
} from '../../application/application.dto';
import { Application } from '../../application/application.entity';
import { CardStatusDto } from '../../card/card-status/card-status.dto';
import { CardStatus } from '../../card/card-status/card-status.entity';
import { CardDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';
import { ApplicationMeetingTypeDto } from '../../code/application-code/application-meeting-type/application-meeting-type.dto';
import { ApplicationMeetingType } from '../../code/application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationRegionDto } from '../../code/application-code/application-region/application-region.dto';
import { ApplicationRegion } from '../../code/application-code/application-region/application-region.entity';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';
import { ApplicationType } from '../../code/application-code/application-type/application-type.entity';
import { CodeService } from '../../code/code.service';
import { UserDto } from '../../user/user.dto';
import { User } from '../../user/user.entity';

@Injectable()
export class ApplicationProfile extends AutomapperProfile {
  constructor(
    @InjectMapper() mapper: Mapper,
    private codeService: CodeService,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, ApplicationType, ApplicationTypeDto);
      createMap(mapper, ApplicationRegion, ApplicationRegionDto);
      createMap(mapper, ApplicationMeetingType, ApplicationMeetingTypeDto);
      createMap(
        mapper,
        ApplicationDecision,
        ApplicationDecisionDto,
        forMember(
          (ad) => ad.documents,
          mapFrom((a) =>
            this.mapper.mapArray(
              a.documents,
              DecisionDocument,
              DecisionDocumentDto,
            ),
          ),
        ),
      );
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
          (ad) => ad.localGovernment,
          mapFrom((a) => a.localGovernment.name),
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
        forMember(
          (ad) => ad.card,
          mapFrom((a) => {
            return this.mapper.map(a.card, Card, CardDto);
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
        forMember(
          (ad) => ad.card,
          mapFrom((a) => {
            return this.mapper.map(a.card, Card, CardDto);
          }),
        ),
      );

      createMap(
        mapper,
        ApplicationDto,
        Application,
        forMember(
          async (a) => a.card.status,
          mapFrom(async (ad) => {
            return await this.codeService.fetchCardStatus(ad.status);
          }),
        ),
        forMember(
          async (a) => a.type,
          mapFrom(async (ad) => {
            return await this.codeService.fetchApplicationType(ad.type);
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
        DecisionDocument,
        DecisionDocumentDto,
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
      );

      createMap(mapper, ApplicationDto, Card);
    };
  }

  private numberToDateSafe(date: number | null): Date | null {
    return date ? new Date(date) : null;
  }
}

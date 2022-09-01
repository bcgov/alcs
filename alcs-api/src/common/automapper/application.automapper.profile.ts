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
import { ApplicationMeetingDto } from '../../application/application-meeting/application-meeting.dto';
import { ApplicationMeeting } from '../../application/application-meeting/application-meeting.entity';
import { ApplicationStatusDto } from '../../application/application-status/application-status.dto';
import { ApplicationStatus } from '../../application/application-status/application-status.entity';
import {
  ApplicationDetailedDto,
  ApplicationDto,
} from '../../application/application.dto';
import { Application } from '../../application/application.entity';

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
      createMap(mapper, ApplicationStatus, ApplicationStatusDto);
      createMap(mapper, ApplicationType, ApplicationTypeDto);
      createMap(mapper, ApplicationStatusDto, ApplicationStatus);
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
          mapFrom((a) => a.status.code),
        ),
        forMember(
          (ad) => ad.type,
          mapFrom((a) => a.type.code),
        ),
        forMember(
          (ad) => ad.board,
          mapFrom((a) => a.board.code),
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
      );

      createMap(
        mapper,
        Application,
        ApplicationDetailedDto,
        forMember(
          (ad) => ad.statusDetails,
          mapFrom((a) =>
            this.mapper.map(a.status, ApplicationStatus, ApplicationStatusDto),
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
          async (a) => a.status,
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
          mapFrom(async (ad) => {
            if (ad.region) {
              return await this.codeService.fetchRegion(ad.region);
            }
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
        ApplicationMeetingDto,
        ApplicationMeeting,
        forMember(
          (a) => a.startDate,
          mapFrom((ad) => new Date(ad.startDate)),
        ),
        forMember(
          (a) => a.endDate,
          mapFrom((ad) => new Date(ad.endDate)),
        ),
      );
    };
  }
}

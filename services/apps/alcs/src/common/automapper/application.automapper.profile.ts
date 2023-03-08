import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import {
  ApplicationReviewGrpc,
  SubmittedApplicationGrpc,
  SubmittedApplicationOwnerGrpc,
  SubmittedApplicationParcelGrpc,
} from '../../application-grpc/alcs-application.message.interface';
import { ApplicationLocalGovernmentDto } from '../../application/application-code/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernment } from '../../application/application-code/application-local-government/application-local-government.entity';
import { ApplicationDocumentDto } from '../../application/application-document/application-document.dto';
import { ApplicationDocument } from '../../application/application-document/application-document.entity';
import {
  ApplicationMeetingDto,
  CreateApplicationMeetingDto,
} from '../../application/application-meeting/application-meeting.dto';
import { ApplicationMeeting } from '../../application/application-meeting/application-meeting.entity';
import { ApplicationPaused } from '../../application/application-paused.entity';
import {
  ApplicationDto,
  ApplicationReviewDto,
  SubmittedApplicationDto,
  SubmittedApplicationOwnerDto,
  SubmittedApplicationParcelDto,
} from '../../application/application.dto';
import { Application } from '../../application/application.entity';
import { CardDto } from '../../card/card.dto';
import { Card } from '../../card/card.entity';
import { ApplicationMeetingTypeDto } from '../../code/application-code/application-meeting-type/application-meeting-type.dto';
import { ApplicationMeetingType } from '../../code/application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationRegionDto } from '../../code/application-code/application-region/application-region.dto';
import { ApplicationRegion } from '../../code/application-code/application-region/application-region.entity';
import { ApplicationTypeDto } from '../../code/application-code/application-type/application-type.dto';
import { ApplicationType } from '../../code/application-code/application-type/application-type.entity';
import { ApplicationDecisionMeetingDto } from '../../decision/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../decision/application-decision-meeting/application-decision-meeting.entity';

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
        ApplicationLocalGovernment,
        ApplicationLocalGovernmentDto,
      );

      createMap(mapper, ApplicationReviewGrpc, ApplicationReviewDto);
      createMap(mapper, SubmittedApplicationGrpc, SubmittedApplicationDto);
      createMap(
        mapper,
        SubmittedApplicationParcelGrpc,
        SubmittedApplicationParcelDto,
      );
      createMap(
        mapper,
        SubmittedApplicationOwnerGrpc,
        SubmittedApplicationOwnerDto,
        forMember(
          (pd) => pd.displayName,
          mapFrom((p) =>
            p.organizationName
              ? p.organizationName
              : `${p.firstName} ${p.lastName}`,
          ),
        ),
      );

      createMap(
        mapper,
        Application,
        ApplicationDto,
        forMember(
          (a) => a.dateSubmittedToAlc,
          mapFrom((ad) => ad.dateSubmittedToAlc?.getTime()),
        ),
        forMember(
          (a) => a.datePaid,
          mapFrom((ad) => ad.datePaid?.getTime()),
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
          (a) => a.notificationSentDate,
          mapFrom((ad) => ad.notificationSentDate?.getTime()),
        ),
        forMember(
          (ad) => ad.card,
          mapFrom((a) => {
            return this.mapper.map(a.card, Card, CardDto);
          }),
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
        ApplicationDocument,
        ApplicationDocumentDto,
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
        forMember(
          (a) => a.documentUuid,
          mapFrom((ad) => ad.document.uuid),
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
          mapFrom((a) => a.meetingPause?.startDate.getTime()),
        ),
        forMember(
          (ad) => ad.meetingEndDate,
          mapFrom((a) => a.meetingPause?.endDate?.getTime()),
        ),
        forMember(
          (ad) => ad.reportStartDate,
          mapFrom((a) => a.reportPause?.startDate?.getTime()),
        ),
        forMember(
          (ad) => ad.reportEndDate,
          mapFrom((a) => a.reportPause?.endDate?.getTime()),
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

  private numberToDateSafe(date?: number | null): Date | null {
    return date ? new Date(date) : null;
  }
}

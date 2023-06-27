import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { ApplicationDecisionMeetingDto } from '../../alcs/application-decision/application-decision-v1/application-decision-meeting/application-decision-meeting.dto';
import { ApplicationDecisionMeeting } from '../../alcs/application-decision/application-decision-v1/application-decision-meeting/application-decision-meeting.entity';
import { ApplicationLocalGovernmentDto } from '../../alcs/application/application-code/application-local-government/application-local-government.dto';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationDocumentCode } from '../../alcs/application/application-document/application-document-code.entity';
import {
  ApplicationDocumentDto,
  ApplicationDocumentTypeDto,
} from '../../alcs/application/application-document/application-document.dto';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import {
  ApplicationMeetingDto,
  CreateApplicationMeetingDto,
} from '../../alcs/application/application-meeting/application-meeting.dto';
import { ApplicationMeeting } from '../../alcs/application/application-meeting/application-meeting.entity';
import { ApplicationPaused } from '../../alcs/application/application-paused.entity';
import {
  AlcsApplicationSubmissionDto,
  ApplicationDto,
} from '../../alcs/application/application.dto';
import { Application } from '../../alcs/application/application.entity';
import { CardDto } from '../../alcs/card/card.dto';
import { Card } from '../../alcs/card/card.entity';
import { ApplicationMeetingTypeDto } from '../../alcs/code/application-code/application-meeting-type/application-meeting-type.dto';
import { ApplicationMeetingType } from '../../alcs/code/application-code/application-meeting-type/application-meeting-type.entity';
import { ApplicationRegionDto } from '../../alcs/code/application-code/application-region/application-region.dto';
import { ApplicationRegion } from '../../alcs/code/application-code/application-region/application-region.entity';
import { ApplicationTypeDto } from '../../alcs/code/application-code/application-type/application-type.dto';
import { ApplicationType } from '../../alcs/code/application-code/application-type/application-type.entity';
import { StaffJournalDto } from '../../alcs/staff-journal/staff-journal.dto';
import { StaffJournal } from '../../alcs/staff-journal/staff-journal.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';

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

      createMap(mapper, ApplicationSubmission, AlcsApplicationSubmissionDto);

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
          (a) => a.notificationSentDate,
          mapFrom((ad) => ad.notificationSentDate?.getTime()),
        ),
        forMember(
          (a) => a.proposalEndDate,
          mapFrom((ad) => ad.proposalEndDate?.getTime()),
        ),
        forMember(
          (a) => a.proposalExpiryDate,
          mapFrom((ad) => ad.proposalExpiryDate?.getTime()),
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
      createMap(mapper, ApplicationDocumentCode, ApplicationDocumentTypeDto);

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

      createMap(
        mapper,
        StaffJournal,
        StaffJournalDto,
        forMember(
          (ud) => ud.author,
          mapFrom((u) => u.author.name),
        ),
      );
    };
  }

  private numberToDateSafe(date?: number | null): Date | null {
    return date ? new Date(date) : null;
  }
}

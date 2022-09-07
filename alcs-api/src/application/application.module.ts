import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { DocumentModule } from '../document/document.module';
import { NotificationModule } from '../notification/notification.module';
import { ApplicationCodeModule } from './application-code/application-code.module';
import { ApplicationDecisionMeetingController } from './application-decision-meeting/application-decision-meeting.controller';
import { ApplicationDecisionMeeting } from './application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from './application-decision-meeting/application-decision-meeting.service';
import { ApplicationDocumentController } from './application-document/application-document.controller';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationHistory } from './application-history.entity';
import { ApplicationMeetingController } from './application-meeting/application-meeting.controller';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting/application-meeting.service';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationStatusController } from './application-status/application-status.controller';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ApplicationStatusService } from './application-status/application-status.service';
import { ApplicationTimeTrackingService } from './application-time-tracking.service';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';
import { ApplicationSubscriber } from './application.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationStatus,
      Application,
      ApplicationHistory,
      ApplicationPaused,
      ApplicationMeeting,
      ApplicationDecisionMeeting,
      ApplicationDocument,
    ]),
    ApplicationCodeModule,
    NotificationModule,
    DocumentModule,
  ],
  providers: [
    ApplicationService,
    ApplicationStatusService,
    ApplicationTimeTrackingService,
    ApplicationSubscriber,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    ApplicationProfile,
    ApplicationDecisionMeetingService,
    ApplicationMeetingService,
    ApplicationDocumentService,
  ],
  controllers: [
    ApplicationController,
    ApplicationStatusController,
    ApplicationDecisionMeetingController,
    ApplicationMeetingController,
    ApplicationDocumentController,
  ],
  exports: [ApplicationService, ApplicationTimeTrackingService],
})
export class ApplicationModule {}

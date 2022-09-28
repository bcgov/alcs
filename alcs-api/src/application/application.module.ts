import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { ApplicationSubtaskProfile } from '../common/automapper/application-subtask.automapper.profile';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { DocumentModule } from '../document/document.module';
import { NotificationModule } from '../notification/notification.module';
import { ApplicationDecisionMeetingController } from './application-decision-meeting/application-decision-meeting.controller';
import { ApplicationDecisionMeeting } from './application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from './application-decision-meeting/application-decision-meeting.service';
import { ApplicationDocumentController } from './application-document/application-document.controller';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationMeetingController } from './application-meeting/application-meeting.controller';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting/application-meeting.service';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationPausedService } from './application-paused/application-paused.service';
import { ApplicationSubtaskController } from './application-subtask/application-subtask.controller';
import { ApplicationTimeTrackingService } from './application-time-tracking.service';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationPaused,
      ApplicationMeeting,
      ApplicationDecisionMeeting,
      ApplicationDocument,
    ]),
    NotificationModule,
    DocumentModule,
    CardModule,
    CodeModule,
  ],
  providers: [
    ApplicationService,
    ApplicationTimeTrackingService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    ApplicationProfile,
    ApplicationSubtaskProfile,
    ApplicationDecisionMeetingService,
    ApplicationMeetingService,
    ApplicationPausedService,
    ApplicationDocumentService,
  ],
  controllers: [
    ApplicationController,
    ApplicationDecisionMeetingController,
    ApplicationMeetingController,
    ApplicationDocumentController,
    ApplicationSubtaskController,
  ],
  exports: [
    ApplicationService,
    ApplicationTimeTrackingService,
    ApplicationProfile,
    ApplicationSubtaskProfile,
  ],
})
export class ApplicationModule {}

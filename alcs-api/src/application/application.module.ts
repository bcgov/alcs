import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { CardType } from '../card/card-type/card-type.entity';
import { CardModule } from '../card/card.module';
import { ApplicationSubtaskProfile } from '../common/automapper/application-subtask.automapper.profile';
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
import { CardHistory } from './application-history.entity';
import { ApplicationMeetingController } from './application-meeting/application-meeting.controller';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting/application-meeting.service';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationPausedService } from './application-paused/application-paused.service';
import { CardSubtaskType } from './application-subtask/application-subtask-type.entity';
import { ApplicationSubtaskController } from './application-subtask/application-subtask.controller';
import { CardSubtask } from './application-subtask/application-subtask.entity';
import { ApplicationSubtaskService } from './application-subtask/application-subtask.service';
import { ApplicationTimeTrackingService } from './application-time-tracking.service';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';
import { CardSubscriber } from './card.subscriber';

// TODO: separate card specific types to board or separate module
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      CardHistory,
      ApplicationPaused,
      ApplicationMeeting,
      ApplicationDecisionMeeting,
      ApplicationDocument,
      CardSubtaskType,
      CardSubtask,
      CardType,
    ]),
    ApplicationCodeModule,
    NotificationModule,
    DocumentModule,
    // TODO: check if this can be deleted later
    CardModule,
  ],
  providers: [
    ApplicationService,
    ApplicationTimeTrackingService,
    CardSubscriber,
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
    ApplicationSubtaskService,
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
    ApplicationSubtaskService,
    ApplicationProfile,
    ApplicationSubtaskProfile,
  ],
})
export class ApplicationModule {}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { Board } from '../board/board.entity';
import { CardModule } from '../card/card.module';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeModule } from '../code/code.module';
import { ApplicationSubtaskProfile } from '../../common/automapper/application-subtask.automapper.profile';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { DocumentModule } from '../../document/document.module';
import { NotificationModule } from '../notification/notification.module';
import { ApplicationLocalGovernmentController } from './application-code/application-local-government/application-local-government.controller';
import { ApplicationLocalGovernment } from './application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from './application-code/application-local-government/application-local-government.service';
import { ApplicationDocumentController } from './application-document/application-document.controller';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationMeetingController } from './application-meeting/application-meeting.controller';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting/application-meeting.service';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationPausedService } from './application-paused/application-paused.service';
import { ApplicationTimeTrackingService } from './application-time-tracking.service';
import { ApplicationController } from './application.controller';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationType,
      ApplicationPaused,
      ApplicationMeeting,
      ApplicationDocument,
      ApplicationLocalGovernment,
      Board,
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
    ApplicationMeetingService,
    ApplicationPausedService,
    ApplicationDocumentService,
    ApplicationLocalGovernmentService,
  ],
  controllers: [
    ApplicationController,
    ApplicationMeetingController,
    ApplicationDocumentController,
    ApplicationLocalGovernmentController,
  ],
  exports: [
    ApplicationService,
    ApplicationTimeTrackingService,
    ApplicationProfile,
    ApplicationSubtaskProfile,
    ApplicationMeetingService,
    ApplicationPausedService,
    ApplicationLocalGovernmentService,
    ApplicationDocumentService,
  ],
})
export class ApplicationModule {}

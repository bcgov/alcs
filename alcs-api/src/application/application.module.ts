import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from 'nest-keycloak-connect';
import { Board } from '../board/board.entity';
import { CardModule } from '../card/card.module';
import { CodeModule } from '../code/code.module';
import { ApplicationDecisionProfile } from '../common/automapper/application-decision.automapper.profile';
import { ApplicationSubtaskProfile } from '../common/automapper/application-subtask.automapper.profile';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { DocumentModule } from '../document/document.module';
import { NotificationModule } from '../notification/notification.module';
import { ApplicationLocalGovernmentController } from './application-code/application-local-government/application-local-government.controller';
import { ApplicationLocalGovernment } from './application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from './application-code/application-local-government/application-local-government.service';
import { ApplicationDecisionMeetingController } from './application-decision-meeting/application-decision-meeting.controller';
import { ApplicationDecisionMeeting } from './application-decision-meeting/application-decision-meeting.entity';
import { ApplicationDecisionMeetingService } from './application-decision-meeting/application-decision-meeting.service';
import { DecisionOutcomeCode } from './application-decision/application-decision-outcome.entity';
import { ApplicationDecisionController } from './application-decision/application-decision.controller';
import { ApplicationDecision } from './application-decision/application-decision.entity';
import { ApplicationDecisionService } from './application-decision/application-decision.service';
import { CeoCriterionCode } from './application-decision/ceo-criterion/ceo-criterion.entity';
import { DecisionDocument } from './application-decision/decision-document.entity';
import { DecisionMakerCode } from './application-decision/decision-maker/decision-maker.entity';
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
      ApplicationPaused,
      ApplicationMeeting,
      ApplicationDecisionMeeting,
      DecisionOutcomeCode,
      DecisionMakerCode,
      CeoCriterionCode,
      ApplicationDocument,
      ApplicationLocalGovernment,
      ApplicationDecision,
      DecisionDocument,
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
    ApplicationDecisionProfile,
    ApplicationDecisionMeetingService,
    ApplicationMeetingService,
    ApplicationPausedService,
    ApplicationDocumentService,
    ApplicationLocalGovernmentService,
    ApplicationDecisionService,
  ],
  controllers: [
    ApplicationController,
    ApplicationDecisionMeetingController,
    ApplicationMeetingController,
    ApplicationDocumentController,
    ApplicationLocalGovernmentController,
    ApplicationDecisionController,
  ],
  exports: [
    ApplicationService,
    ApplicationTimeTrackingService,
    ApplicationProfile,
    ApplicationSubtaskProfile,
  ],
})
export class ApplicationModule {}

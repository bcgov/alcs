import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationOwnerProfile } from '../../common/automapper/application-owner.automapper.profile';
import { ApplicationParcelProfile } from '../../common/automapper/application-parcel.automapper.profile';
import { ApplicationSubtaskProfile } from '../../common/automapper/application-subtask.automapper.profile';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { DocumentModule } from '../../document/document.module';
import { ApplicationSubmissionReview } from '../../portal/application-submission-review/application-submission-review.entity';
import { ApplicationStatus } from '../../portal/application-submission/application-status/application-status.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { Board } from '../board/board.entity';
import { CardModule } from '../card/card.module';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeModule } from '../code/code.module';
import { NotificationModule } from '../notification/notification.module';
import { ApplicationLocalGovernmentController } from './application-code/application-local-government/application-local-government.controller';
import { ApplicationLocalGovernment } from './application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from './application-code/application-local-government/application-local-government.service';
import { ApplicationDocumentCode } from './application-document/application-document-code.entity';
import { ApplicationDocumentController } from './application-document/application-document.controller';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationMeetingController } from './application-meeting/application-meeting.controller';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting/application-meeting.service';
import { ApplicationPaused } from './application-paused.entity';
import { ApplicationPausedService } from './application-paused/application-paused.service';
import { ApplicationSubmissionReviewController } from './application-submission-review/application-submission-review.controller';
import { ApplicationSubmissionReviewService } from './application-submission-review/application-submission-review.service';
import { ApplicationSubmissionController } from './application-submission/application-submission.controller';
import { ApplicationSubmissionService } from './application-submission/application-submission.service';
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
      ApplicationDocumentCode,
      ApplicationLocalGovernment,
      Board,
      ApplicationSubmission,
      ApplicationSubmissionReview,
      ApplicationStatus,
    ]),
    NotificationModule,
    DocumentModule,
    CardModule,
    CodeModule,
  ],
  providers: [
    ApplicationService,
    ApplicationTimeTrackingService,
    ApplicationProfile,
    ApplicationSubtaskProfile,
    ApplicationParcelProfile,
    ApplicationOwnerProfile,
    ApplicationMeetingService,
    ApplicationPausedService,
    ApplicationDocumentService,
    ApplicationLocalGovernmentService,
    ApplicationSubmissionService,
    ApplicationSubmissionReviewService,
  ],
  controllers: [
    ApplicationController,
    ApplicationMeetingController,
    ApplicationDocumentController,
    ApplicationLocalGovernmentController,
    ApplicationSubmissionController,
    ApplicationSubmissionReviewController,
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

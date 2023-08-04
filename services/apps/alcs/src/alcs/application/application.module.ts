import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationSubmissionStatusModule } from '../../application-submission-status/application-submission-status.module';
import { ApplicationSubmissionStatusType } from '../../application-submission-status/submission-status-type.entity';
import { ApplicationSubmissionToSubmissionStatus } from '../../application-submission-status/submission-status.entity';
import { ApplicationOwnerProfile } from '../../common/automapper/application-owner.automapper.profile';
import { ApplicationParcelProfile } from '../../common/automapper/application-parcel.automapper.profile';
import { ApplicationSubmissionProfile } from '../../common/automapper/application-submission.automapper.profile';
import { ApplicationSubtaskProfile } from '../../common/automapper/application-subtask.automapper.profile';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { ApplicationSubmissionReview } from '../../portal/application-submission-review/application-submission-review.entity';
import { ApplicationParcel } from '../../portal/application-submission/application-parcel/application-parcel.entity';
import { ApplicationSubmission } from '../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionModule } from '../../portal/application-submission/application-submission.module';
import { Board } from '../board/board.entity';
import { CardModule } from '../card/card.module';
import { ApplicationType } from '../code/application-code/application-type/application-type.entity';
import { CodeModule } from '../code/code.module';
import { LocalGovernment } from '../local-government/local-government.entity';
import { LocalGovernmentModule } from '../local-government/local-government.module';
import { NotificationModule } from '../notification/notification.module';
import { LocalGovernmentController } from '../local-government/local-government.controller';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { DocumentCode } from '../../document/document-code.entity';
import { ApplicationDocumentController } from './application-document/application-document.controller';
import { ApplicationDocument } from './application-document/application-document.entity';
import { ApplicationDocumentService } from './application-document/application-document.service';
import { ApplicationMeetingController } from './application-meeting/application-meeting.controller';
import { ApplicationMeeting } from './application-meeting/application-meeting.entity';
import { ApplicationMeetingService } from './application-meeting/application-meeting.service';
import { ApplicationParcelController } from './application-parcel/application-parcel.controller';
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
      DocumentCode,
      ApplicationParcel,
      Board,
      ApplicationSubmission,
      ApplicationSubmissionReview,
      ApplicationSubmissionStatusType,
      ApplicationSubmissionToSubmissionStatus,
      LocalGovernment,
    ]),
    NotificationModule,
    DocumentModule,
    CardModule,
    CodeModule,
    FileNumberModule,
    forwardRef(() => ApplicationSubmissionModule),
    ApplicationSubmissionStatusModule,
    LocalGovernmentModule,
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
    LocalGovernmentService,
    ApplicationSubmissionService,
    ApplicationSubmissionReviewService,
    ApplicationSubmissionProfile,
  ],
  controllers: [
    ApplicationController,
    ApplicationMeetingController,
    ApplicationDocumentController,
    LocalGovernmentController,
    ApplicationSubmissionController,
    ApplicationSubmissionReviewController,
    ApplicationParcelController,
  ],
  exports: [
    ApplicationService,
    ApplicationTimeTrackingService,
    ApplicationProfile,
    ApplicationSubtaskProfile,
    ApplicationMeetingService,
    ApplicationPausedService,
    LocalGovernmentService,
    ApplicationDocumentService,
  ],
})
export class ApplicationModule {}

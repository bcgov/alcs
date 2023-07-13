import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../../alcs/application/application.module';
import { ApplicationSubmissionReviewProfile } from '../../common/automapper/application-submission-review.automapper.profile';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { ApplicationSubmissionStatusService } from '../application-submission/submission-status/application-submission-status.service';
import { SubmissionStatusType } from '../application-submission/submission-status/submission-status-type.entity';
import { ApplicationSubmissionToSubmissionStatus } from '../application-submission/submission-status/submission-status.entity';
import { ApplicationSubmissionReviewController } from './application-submission-review.controller';
import { ApplicationSubmissionReview } from './application-submission-review.entity';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationSubmissionReview,
      ApplicationSubmissionToSubmissionStatus,
      SubmissionStatusType,
      ApplicationSubmission,
    ]),
    forwardRef(() => ApplicationSubmissionModule),
    forwardRef(() => ApplicationModule),
  ],
  providers: [
    ApplicationSubmissionReviewService,
    ApplicationSubmissionReviewProfile,
    ApplicationSubmissionStatusService,
  ],
  exports: [ApplicationSubmissionReviewService],
  controllers: [ApplicationSubmissionReviewController],
})
export class ApplicationSubmissionReviewModule {}

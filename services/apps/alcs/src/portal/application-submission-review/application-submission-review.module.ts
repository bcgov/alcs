import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../../alcs/application/application.module';
import { ApplicationSubmissionStatusModule } from '../../application-submission-status/application-submission-status.module';
import { ApplicationSubmissionReviewProfile } from '../../common/automapper/application-submission-review.automapper.profile';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { ApplicationSubmissionReviewController } from './application-submission-review.controller';
import { ApplicationSubmissionReview } from './application-submission-review.entity';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationSubmissionReview]),
    forwardRef(() => ApplicationSubmissionModule),
    forwardRef(() => ApplicationModule),
    ApplicationSubmissionStatusModule,
  ],
  providers: [
    ApplicationSubmissionReviewService,
    ApplicationSubmissionReviewProfile,
  ],
  exports: [ApplicationSubmissionReviewService],
  controllers: [ApplicationSubmissionReviewController],
})
export class ApplicationSubmissionReviewModule {}

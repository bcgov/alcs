import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../../alcs/application/application.module';
import { ApplicationSubmissionReviewProfile } from '../../common/automapper/application-submission-review.automapper.profile';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { ApplicationSubmissionReviewController } from './application-submission-review.controller';
import { ApplicationSubmissionReview } from './application-submission-review.entity';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationSubmissionReview]),
    ApplicationSubmissionModule,
    ApplicationModule,
  ],
  providers: [
    ApplicationSubmissionReviewService,
    ApplicationSubmissionReviewProfile,
  ],
  controllers: [ApplicationSubmissionReviewController],
})
export class ApplicationSubmissionReviewModule {}

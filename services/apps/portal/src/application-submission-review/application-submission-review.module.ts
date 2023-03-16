import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlcsModule } from '../alcs/alcs.module';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { ApplicationReviewProfile } from '../common/automapper/application-review.automapper.profile';
import { ApplicationSubmissionReviewController } from './application-submission-review.controller';
import { ApplicationSubmissionReview } from './application-submission-review.entity';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationSubmissionReview]),
    ApplicationSubmissionModule,
    AlcsModule,
  ],
  providers: [ApplicationSubmissionReviewService, ApplicationReviewProfile],
  controllers: [ApplicationSubmissionReviewController],
})
export class ApplicationSubmissionReviewModule {}

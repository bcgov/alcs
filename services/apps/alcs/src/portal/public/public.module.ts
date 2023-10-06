import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationDecisionV2Module } from '../../alcs/application-decision/application-decision-v2/application-decision-v2.module';
import { ApplicationSubmissionStatusModule } from '../../alcs/application/application-submission-status/application-submission-status.module';
import { ApplicationModule } from '../../alcs/application/application.module';
import { NotificationSubmissionStatusModule } from '../../alcs/notification/notification-submission-status/notification-submission-status.module';
import { PublicAutomapperProfile } from '../../common/automapper/public.automapper.profile';
import { ApplicationSubmissionReviewModule } from '../application-submission-review/application-submission-review.module';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { PublicApplicationService } from './public-application.service';
import { PublicController } from './public.controller';
import { PublicSearchModule } from './search/public-search.module';
import { PublicStatusController } from './status/public-status.controller';

@Module({
  imports: [
    PublicSearchModule,
    ApplicationSubmissionStatusModule,
    NotificationSubmissionStatusModule,
    ApplicationModule,
    ApplicationSubmissionModule,
    ApplicationSubmissionReviewModule,
    ApplicationDecisionV2Module,
    RouterModule.register([{ path: 'public', module: PublicSearchModule }]),
  ],
  controllers: [PublicStatusController, PublicController],
  providers: [PublicAutomapperProfile, PublicApplicationService],
  exports: [],
})
export class PublicModule {}

import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ApplicationDecisionV2Module } from '../../alcs/application-decision/application-decision-v2/application-decision-v2.module';
import { ApplicationSubmissionStatusModule } from '../../alcs/application/application-submission-status/application-submission-status.module';
import { ApplicationModule } from '../../alcs/application/application.module';
import { NoticeOfIntentDecisionModule } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentModule } from '../../alcs/notice-of-intent/notice-of-intent.module';
import { NotificationSubmissionStatusModule } from '../../alcs/notification/notification-submission-status/notification-submission-status.module';
import { PublicAutomapperProfile } from '../../common/automapper/public.automapper.profile';
import { ApplicationSubmissionReviewModule } from '../application-submission-review/application-submission-review.module';
import { ApplicationSubmissionModule } from '../application-submission/application-submission.module';
import { NoticeOfIntentSubmissionModule } from '../notice-of-intent-submission/notice-of-intent-submission.module';
import { ApplicationDecisionController } from './application/application-decision.controller';
import { PublicApplicationService } from './application/public-application.service';
import { NoticeOfIntentDecisionController } from './notice-of-intent/notice-of-intent-decision.controller';
import { PublicNoticeOfIntentService } from './notice-of-intent/public-notice-of-intent.service';
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
    NoticeOfIntentModule,
    NoticeOfIntentSubmissionModule,
    NoticeOfIntentDecisionModule,
    RouterModule.register([{ path: 'public', module: PublicSearchModule }]),
  ],
  controllers: [
    PublicStatusController,
    PublicController,
    ApplicationDecisionController,
    NoticeOfIntentDecisionController,
  ],
  providers: [
    PublicAutomapperProfile,
    PublicApplicationService,
    PublicNoticeOfIntentService,
  ],
  exports: [],
})
export class PublicModule {}

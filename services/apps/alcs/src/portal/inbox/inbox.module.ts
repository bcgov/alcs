import { RedisModule } from '@app/common/redis/redis.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationSubmissionStatusModule } from '../../alcs/application/application-submission-status/application-submission-status.module';
import { Application } from '../../alcs/application/application.entity';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { NoticeOfIntentSubmissionStatusModule } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { NotificationSubmissionStatusModule } from '../../alcs/notification/notification-submission-status/notification-submission-status.module';
import { Notification } from '../../alcs/notification/notification.entity';
import { ApplicationSubmissionReview } from '../application-submission-review/application-submission-review.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NotificationSubmission } from '../notification-submission/notification-submission.entity';
import { InboxApplicationSubmissionView } from './application/inbox-application-view.entity';
import { InboxApplicationService } from './application/inbox-application.service';
import { InboxController } from './inbox.controller';
import { InboxNoticeOfIntentSubmissionView } from './notice-of-intent/inbox-notice-of-intent-view.entity';
import { InboxNoticeOfIntentService } from './notice-of-intent/inbox-notice-of-intent.service';
import { InboxNotificationSubmissionView } from './notification/inbox-notification-view.entity';
import { InboxNotificationService } from './notification/inbox-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InboxApplicationSubmissionView,
      InboxNoticeOfIntentSubmissionView,
      InboxNotificationSubmissionView,
      LocalGovernment,
      Application,
      ApplicationSubmission,
      ApplicationSubmissionReview,
      NoticeOfIntent,
      NoticeOfIntentSubmission,
      Notification,
      NotificationSubmission,
    ]),
    RedisModule,
    ApplicationSubmissionStatusModule,
    NoticeOfIntentSubmissionStatusModule,
    NotificationSubmissionStatusModule,
  ],
  providers: [
    InboxApplicationService,
    InboxNoticeOfIntentService,
    InboxNotificationService,
  ],
  controllers: [InboxController],
})
export class InboxModule {}

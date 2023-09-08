import { BullModule } from '@nestjs/bull';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ApplicationSubmissionStatusModule } from '../../alcs/application/application-submission-status/application-submission-status.module';
import { ApplicationModule } from '../../alcs/application/application.module';
import { MessageModule } from '../../alcs/message/message.module';
import { NoticeOfIntentSubmissionStatusModule } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { EmailModule } from '../../providers/email/email.module';
import { BullConfigService } from '../bullConfig.service';
import { ApplicationExpiryConsumer } from './application/application-expiry/application-expiry.consumer';
import { ApplicationSubmissionStatusEmailConsumer } from './application/status-emails/status-emails.consumer';
import { CleanUpNotificationsConsumer } from './cleanUpNotifications.consumer';
import { NoticeOfIntentSubmissionStatusEmailConsumer } from './notice-of-intent/status-emails.consumer';
import { QUEUES, SchedulerService } from './scheduler.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
    BullModule.registerQueue({
      name: QUEUES.APP_EXPIRY,
    }),
    BullModule.registerQueue({
      name: QUEUES.CLEANUP_NOTIFICATIONS,
    }),
    BullModule.registerQueue({
      name: QUEUES.APPLICATION_STATUS_EMAILS,
    }),
    BullModule.registerQueue({
      name: QUEUES.NOTICE_OF_INTENTS_STATUS_EMAILS,
    }),
    EmailModule,
    ApplicationModule,
    MessageModule,
    ApplicationSubmissionStatusModule,
    NoticeOfIntentSubmissionStatusModule,
  ],
  providers: [
    SchedulerService,
    ApplicationExpiryConsumer,
    CleanUpNotificationsConsumer,
    ApplicationSubmissionStatusEmailConsumer,
    NoticeOfIntentSubmissionStatusEmailConsumer,
  ],
  exports: [SchedulerService],
})
export class SchedulerModule implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await this.schedulerService.setup();
  }

  constructor(private schedulerService: SchedulerService) {}
}

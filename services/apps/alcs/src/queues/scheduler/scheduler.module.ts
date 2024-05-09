import { BullModule } from '@nestjs/bullmq';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ApplicationDecisionModule } from '../../alcs/application-decision/application-decision.module';
import { ApplicationSubmissionStatusModule } from '../../alcs/application/application-submission-status/application-submission-status.module';
import { ApplicationModule } from '../../alcs/application/application.module';
import { MessageModule } from '../../alcs/message/message.module';
import { NoticeOfIntentDecisionModule } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentSubmissionStatusModule } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { NoticeOfIntentModule } from '../../alcs/notice-of-intent/notice-of-intent.module';
import { EmailModule } from '../../providers/email/email.module';
import { BullConfigService } from '../bullConfig.service';
import { ApplicationExpiryConsumer } from './application/application-expiry/application-expiry.consumer';
import { ApplicationDecisionEmailConsumer } from './application/decision-emails/decision-emails.consumer';
import { ApplicationSubmissionStatusEmailConsumer } from './application/status-emails/status-emails.consumer';
import { CleanUpNotificationsConsumer } from './cleanUpNotifications.consumer';
import { NoticeOfIntentDecisionEmailsConsumer } from './notice-of-intent/decision-emails.consumer';
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
      name: QUEUES.APPLICATION_DECISION_EMAILS,
    }),
    BullModule.registerQueue({
      name: QUEUES.NOTICE_OF_INTENTS_DECISION_EMAILS,
    }),
    EmailModule,
    ApplicationModule,
    MessageModule,
    ApplicationSubmissionStatusModule,
    NoticeOfIntentSubmissionStatusModule,
    NoticeOfIntentModule,
    NoticeOfIntentDecisionModule,
    ApplicationDecisionModule,
  ],
  providers: [
    SchedulerService,
    ApplicationExpiryConsumer,
    CleanUpNotificationsConsumer,
    ApplicationSubmissionStatusEmailConsumer,
    ApplicationDecisionEmailConsumer,
    NoticeOfIntentDecisionEmailsConsumer,
  ],
  exports: [SchedulerService],
})
export class SchedulerModule implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await this.schedulerService.setup();
  }

  constructor(private schedulerService: SchedulerService) {}
}

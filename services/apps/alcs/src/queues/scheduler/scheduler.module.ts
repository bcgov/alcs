import { BullModule } from '@nestjs/bull';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { NotificationModule } from '../../notification/notification.module';
import { EmailModule } from '../../providers/email/email.module';
import { BullConfigService } from '../bullConfig.service';
import { ApplicationExpiryConsumer } from './applicationExpiry.consumer';
import { CleanUpNotificationsConsumer } from './cleanUpNotifications.consumer';
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
    EmailModule,
    ApplicationModule,
    NotificationModule,
  ],
  providers: [
    SchedulerService,
    ApplicationExpiryConsumer,
    CleanUpNotificationsConsumer,
  ],
  exports: [SchedulerService],
})
export class SchedulerModule implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await this.schedulerService.setup();
  }

  constructor(private schedulerService: SchedulerService) {}
}

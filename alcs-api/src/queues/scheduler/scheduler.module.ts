import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { EmailModule } from '../../providers/email/email.module';
import { BullConfigService } from '../bullConfig.service';
import { SchedulerConsumerService } from './scheduler.consumer.service';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
    BullModule.registerQueue({
      name: 'SchedulerQueue',
    }),
    EmailModule,
    ApplicationModule,
  ],
  providers: [SchedulerService, SchedulerConsumerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSubmissionStatusModule } from '../notification-submission-status/notification-submission-status.module';
import { NotificationModule } from '../notification.module';
import { NotificationTimelineController } from './notification-timeline.controller';
import { NotificationTimelineService } from './notification-timeline.service';
import { Notification } from '../notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    NotificationModule,
    NotificationSubmissionStatusModule,
  ],
  providers: [NotificationTimelineService],
  controllers: [NotificationTimelineController],
})
export class NotificationTimelineModule {}

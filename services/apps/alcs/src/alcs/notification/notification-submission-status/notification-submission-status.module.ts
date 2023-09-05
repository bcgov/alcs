import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';
import { NotificationSubmissionStatusType } from './notification-status-type.entity';
import { NotificationSubmissionToSubmissionStatus } from './notification-status.entity';
import { NotificationSubmissionStatusController } from './notification-submission-status.controller';
import { NotificationSubmissionStatusService } from './notification-submission-status.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationSubmissionToSubmissionStatus,
      NotificationSubmissionStatusType,
      NotificationSubmission,
    ]),
  ],
  providers: [NotificationSubmissionStatusService],
  exports: [NotificationSubmissionStatusService],
  controllers: [NotificationSubmissionStatusController],
})
export class NotificationSubmissionStatusModule {}

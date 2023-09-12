import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSubmissionProfile } from '../../../common/automapper/notification-submission.automapper.profile';
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
  providers: [
    NotificationSubmissionStatusService,
    NotificationSubmissionProfile,
  ],
  exports: [NotificationSubmissionStatusService],
  controllers: [NotificationSubmissionStatusController],
})
export class NotificationSubmissionStatusModule {}

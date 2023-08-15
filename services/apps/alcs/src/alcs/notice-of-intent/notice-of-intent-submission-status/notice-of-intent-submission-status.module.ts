import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionStatusType } from './notice-of-intent-status-type.entity';
import { NoticeOfIntentSubmissionToSubmissionStatus } from './notice-of-intent-status.entity';
import { NoticeOfIntentSubmissionStatusController } from './notice-of-intent-submission-status.controller';
import { NoticeOfIntentSubmissionStatusService } from './notice-of-intent-submission-status.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoticeOfIntentSubmissionToSubmissionStatus,
      NoticeOfIntentSubmissionStatusType,
      NoticeOfIntentSubmission,
    ]),
  ],
  providers: [NoticeOfIntentSubmissionStatusService],
  exports: [NoticeOfIntentSubmissionStatusService],
  controllers: [NoticeOfIntentSubmissionStatusController],
})
export class NoticeOfIntentSubmissionStatusModule {}

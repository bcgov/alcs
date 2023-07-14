import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationSubmission } from '../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionStatusService } from './application-submission-status.service';
import { ApplicationSubmissionStatusType } from './submission-status-type.entity';
import { ApplicationSubmissionToSubmissionStatus } from './submission-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationSubmissionToSubmissionStatus,
      ApplicationSubmissionStatusType,
      ApplicationSubmission,
    ]),
  ],
  providers: [ApplicationSubmissionStatusService],
  exports: [ApplicationSubmissionStatusService],
})
export class ApplicationSubmissionStatusModule {}

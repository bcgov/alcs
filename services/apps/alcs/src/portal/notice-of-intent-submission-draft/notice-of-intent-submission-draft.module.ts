import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentSubmissionStatusModule } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { NoticeOfIntentSubmission } from '../notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionModule } from '../notice-of-intent-submission/notice-of-intent-submission.module';
import { PdfGenerationModule } from '../pdf-generation/pdf-generation.module';
import { NoticeOfIntentSubmissionDraftController } from './notice-of-intent-submission-draft.controller';
import { NoticeOfIntentSubmissionDraftService } from './notice-of-intent-submission-draft.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NoticeOfIntentSubmission]),
    NoticeOfIntentSubmissionModule,
    PdfGenerationModule,
    NoticeOfIntentSubmissionStatusModule,
  ],
  providers: [NoticeOfIntentSubmissionDraftService],
  controllers: [NoticeOfIntentSubmissionDraftController],
})
export class NoticeOfIntentSubmissionDraftModule {}

import { Module } from '@nestjs/common';
import { NoticeOfIntentDecisionModule } from '../../alcs/notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentSubmissionModule } from '../notice-of-intent-submission/notice-of-intent-submission.module';
import { NoticeOfIntentDecisionController } from './notice-of-intent-decision.controller';

@Module({
  imports: [NoticeOfIntentDecisionModule, NoticeOfIntentSubmissionModule],
  controllers: [NoticeOfIntentDecisionController],
  providers: [],
  exports: [],
})
export class PortalNoticeOfIntentDecisionModule {}

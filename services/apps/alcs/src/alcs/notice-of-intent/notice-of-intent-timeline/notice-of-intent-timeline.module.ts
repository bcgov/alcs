import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentDecision } from '../../notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentModification } from '../../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.entity';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { NoticeOfIntentModule } from '../notice-of-intent.module';
import { NoticeOfIntentTimelineController } from './notice-of-intent-timeline.controller';
import { NoticeOfIntentTimelineService } from './notice-of-intent-timeline.service';
import { NoticeOfIntentSubmissionStatusModule } from '../notice-of-intent-submission-status/notice-of-intent-submission-status.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoticeOfIntent,
      NoticeOfIntentModification,
      NoticeOfIntentDecision,
    ]),
    NoticeOfIntentModule,
    NoticeOfIntentSubmissionStatusModule,
  ],
  providers: [NoticeOfIntentTimelineService],
  controllers: [NoticeOfIntentTimelineController],
})
export class NoticeOfIntentTimelineModule {}

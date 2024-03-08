import { Module } from '@nestjs/common';
import { ApplicationSubmissionStatusModule } from '../application/application-submission-status/application-submission-status.module';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { NoticeOfIntentDecisionModule } from '../notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentModule } from '../notice-of-intent/notice-of-intent.module';
import { ApplicationImportService } from './application-import.service';
import { NoticeOfIntentImportService } from './noi-import.service';

@Module({
  providers: [ApplicationImportService, NoticeOfIntentImportService],
  imports: [
    ApplicationModule,
    ApplicationSubmissionStatusModule,
    BoardModule,
    NoticeOfIntentModule,
    NoticeOfIntentDecisionModule,
    CardModule,
  ],
})
export class ImportModule {}

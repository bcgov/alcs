import { Module } from '@nestjs/common';
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
    BoardModule,
    NoticeOfIntentModule,
    NoticeOfIntentDecisionModule,
    CardModule,
  ],
})
export class ImportModule {}

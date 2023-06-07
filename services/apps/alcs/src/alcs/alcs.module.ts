import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { ApplicationModule } from './application/application.module';
import { BoardModule } from './board/board.module';
import { CardModule } from './card/card.module';
import { CodeModule } from './code/code.module';
import { CommentModule } from './comment/comment.module';
import { CommissionerModule } from './commissioner/commissioner.module';
import { CovenantModule } from './covenant/covenant.module';
import { ApplicationDecisionModule } from './application-decision/application-decision.module';
import { HomeModule } from './home/home.module';
import { ImportModule } from './import/import.module';
import { NoticeOfIntentDecisionModule } from './notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentModule } from './notice-of-intent/notice-of-intent.module';
import { NotificationModule } from './notification/notification.module';
import { PlanningReviewModule } from './planning-review/planning-review.module';
import { StaffJournalModule } from './staff-journal/staff-journal.module';

@Module({
  imports: [
    ImportModule,
    ApplicationModule,
    CommentModule,
    NotificationModule,
    BoardModule,
    CodeModule,
    PlanningReviewModule,
    CovenantModule,
    CommissionerModule,
    ApplicationDecisionModule,
    AdminModule,
    CardModule,
    HomeModule,
    NoticeOfIntentModule,
    StaffJournalModule,
    NoticeOfIntentDecisionModule,
    RouterModule.register([
      { path: 'alcs', module: ApplicationModule },
      { path: 'alcs', module: CommentModule },
      { path: 'alcs', module: NotificationModule },
      { path: 'alcs', module: BoardModule },
      { path: 'alcs', module: CodeModule },
      { path: 'alcs', module: PlanningReviewModule },
      { path: 'alcs', module: CovenantModule },
      { path: 'alcs', module: CommissionerModule },
      { path: 'alcs', module: ApplicationDecisionModule },
      { path: 'alcs', module: AdminModule },
      { path: 'alcs', module: CardModule },
      { path: 'alcs', module: HomeModule },
      { path: 'alcs', module: NoticeOfIntentModule },
      { path: 'alcs', module: NoticeOfIntentDecisionModule },
      { path: 'alcs', module: StaffJournalModule },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AlcsModule {}

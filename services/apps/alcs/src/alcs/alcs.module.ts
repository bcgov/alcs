import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { ApplicationDecisionModule } from './application-decision/application-decision.module';
import { ApplicationSubmissionStatusModule } from './application/application-submission-status/application-submission-status.module';
import { ApplicationTimelineModule } from './application/application-timeline/application-timeline.module';
import { ApplicationModule } from './application/application.module';
import { BoardModule } from './board/board.module';
import { CardModule } from './card/card.module';
import { CodeModule } from './code/code.module';
import { CommentModule } from './comment/comment.module';
import { CommissionerModule } from './commissioner/commissioner.module';
import { CovenantModule } from './covenant/covenant.module';
import { HomeModule } from './home/home.module';
import { ImportModule } from './import/import.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { LocalGovernmentModule } from './local-government/local-government.module';
import { MessageModule } from './message/message.module';
import { NoticeOfIntentDecisionModule } from './notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentSubmissionStatusModule } from './notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { NoticeOfIntentTimelineModule } from './notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.module';
import { NoticeOfIntentModule } from './notice-of-intent/notice-of-intent.module';
import { NotificationSubmissionStatusModule } from './notification/notification-submission-status/notification-submission-status.module';
import { NotificationTimelineModule } from './notification/notification-timeline/notification-timeline.module';
import { NotificationModule } from './notification/notification.module';
import { PlanningReviewDecisionModule } from './planning-review/planning-review-decision/planning-review-decision.module';
import { PlanningReviewModule } from './planning-review/planning-review.module';
import { SearchModule } from './search/search.module';
import { StaffJournalModule } from './staff-journal/staff-journal.module';

@Module({
  imports: [
    ImportModule,
    ApplicationModule,
    CommentModule,
    MessageModule,
    BoardModule,
    CodeModule,
    PlanningReviewModule,
    PlanningReviewDecisionModule,
    CovenantModule,
    CommissionerModule,
    ApplicationDecisionModule,
    AdminModule,
    CardModule,
    HomeModule,
    NoticeOfIntentModule,
    StaffJournalModule,
    NoticeOfIntentDecisionModule,
    ApplicationTimelineModule,
    NoticeOfIntentTimelineModule,
    SearchModule,
    LocalGovernmentModule,
    NotificationModule,
    NotificationTimelineModule,
    InquiryModule,
    RouterModule.register([
      { path: 'alcs', module: ApplicationModule },
      { path: 'alcs', module: CommentModule },
      { path: 'alcs', module: MessageModule },
      { path: 'alcs', module: BoardModule },
      { path: 'alcs', module: CodeModule },
      { path: 'alcs', module: PlanningReviewModule },
      { path: 'alcs', module: PlanningReviewDecisionModule },
      { path: 'alcs', module: CovenantModule },
      { path: 'alcs', module: CommissionerModule },
      { path: 'alcs', module: ApplicationDecisionModule },
      { path: 'alcs', module: AdminModule },
      { path: 'alcs', module: CardModule },
      { path: 'alcs', module: HomeModule },
      { path: 'alcs', module: NoticeOfIntentModule },
      { path: 'alcs', module: NoticeOfIntentDecisionModule },
      { path: 'alcs', module: StaffJournalModule },
      { path: 'alcs', module: SearchModule },
      { path: 'alcs', module: ApplicationSubmissionStatusModule },
      { path: 'alcs', module: NoticeOfIntentSubmissionStatusModule },
      { path: 'alcs', module: LocalGovernmentModule },
      { path: 'alcs', module: ApplicationTimelineModule },
      { path: 'alcs', module: NoticeOfIntentTimelineModule },
      { path: 'alcs', module: NotificationModule },
      { path: 'alcs', module: NotificationSubmissionStatusModule },
      { path: 'alcs', module: NotificationTimelineModule },
      { path: 'alcs', module: InquiryModule },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AlcsModule {}

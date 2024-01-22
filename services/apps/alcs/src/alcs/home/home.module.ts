import { Module } from '@nestjs/common';
import { ApplicationSubtaskProfile } from '../../common/automapper/application-subtask.automapper.profile';
import { UserModule } from '../../user/user.module';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { ApplicationModule } from '../application/application.module';
import { CovenantModule } from '../covenant/covenant.module';
import { NoticeOfIntentDecisionModule } from '../notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentModule } from '../notice-of-intent/notice-of-intent.module';
import { NotificationModule } from '../notification/notification.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { HomeController } from './home.controller';

@Module({
  imports: [
    ApplicationModule,
    UserModule,
    PlanningReviewModule,
    CovenantModule,
    ApplicationDecisionModule,
    NoticeOfIntentModule,
    NoticeOfIntentDecisionModule,
    NotificationModule,
  ],
  providers: [ApplicationSubtaskProfile],
  controllers: [HomeController],
})
export class HomeModule {}

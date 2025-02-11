import { Module } from '@nestjs/common';
import { ApplicationSubtaskProfile } from '../../common/automapper/application-subtask.automapper.profile';
import { UserModule } from '../../user/user.module';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { ApplicationModule } from '../application/application.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { NoticeOfIntentDecisionModule } from '../notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentModule } from '../notice-of-intent/notice-of-intent.module';
import { NotificationModule } from '../notification/notification.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { HomeController } from './home.controller';
import { AdminModule } from '../admin/admin.module';
import { CardModule } from '../card/card.module';
import { ApplicationDecisionConditionService } from '../application-decision/application-decision-condition/application-decision-condition.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationDecisionConditionToComponentLot } from '../application-decision/application-condition-to-component-lot/application-decision-condition-to-component-lot.entity';
import { ApplicationDecisionConditionComponentPlanNumber } from '../application-decision/application-decision-component-to-condition/application-decision-component-to-condition-plan-number.entity';
import { ApplicationDecisionConditionType } from '../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionCondition } from '../application-decision/application-decision-condition/application-decision-condition.entity';
import { ApplicationDecisionConditionDate } from '../application-decision/application-decision-condition/application-decision-condition-date/application-decision-condition-date.entity';
import { ApplicationModification } from '../application-decision/application-modification/application-modification.entity';
import { ApplicationReconsideration } from '../application-decision/application-reconsideration/application-reconsideration.entity';
import { NoticeOfIntentDecisionConditionService } from '../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { NoticeOfIntentDecisionCondition } from '../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionType } from '../notice-of-intent-decision/notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import { NoticeOfIntentModification } from '../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationDecisionCondition,
      ApplicationDecisionConditionType,
      ApplicationDecisionConditionComponentPlanNumber,
      ApplicationDecisionConditionToComponentLot,
      ApplicationDecisionConditionDate,
      ApplicationModification,
      ApplicationReconsideration,
      NoticeOfIntentDecisionCondition,
      NoticeOfIntentDecisionConditionType,
      NoticeOfIntentModification,
    ]),
    ApplicationModule,
    UserModule,
    PlanningReviewModule,
    ApplicationDecisionModule,
    NoticeOfIntentModule,
    NoticeOfIntentDecisionModule,
    NotificationModule,
    InquiryModule,
    AdminModule,
    CardModule,
  ],
  providers: [ApplicationSubtaskProfile, ApplicationDecisionConditionService, NoticeOfIntentDecisionConditionService],
  controllers: [HomeController],
})
export class HomeModule {}

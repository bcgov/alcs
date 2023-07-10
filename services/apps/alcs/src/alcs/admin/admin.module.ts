import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { CovenantModule } from '../covenant/covenant.module';
import { ApplicationCeoCriterionCode } from '../application-decision/application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { NoticeOfIntentDecisionModule } from '../notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentSubtype } from '../notice-of-intent/notice-of-intent-subtype.entity';
import { NoticeOfIntentModule } from '../notice-of-intent/notice-of-intent.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { ApplicationCeoCriterionController } from './application-ceo-criterion/application-ceo-criterion.controller';
import { ApplicationCeoCriterionService } from './application-ceo-criterion/application-ceo-criterion.service';
import { HolidayController } from './holiday/holiday.controller';
import { HolidayEntity } from './holiday/holiday.entity';
import { HolidayService } from './holiday/holiday.service';
import { LocalGovernmentController } from './local-government/local-government.controller';
import { NoiSubtypeController } from './noi-subtype/noi-subtype.controller';
import { NoiSubtypeService } from './noi-subtype/noi-subtype.service';
import { UnarchiveCardController } from './unarchive-card/unarchive-card.controller';
import { UnarchiveCardService } from './unarchive-card/unarchive-card.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HolidayEntity,
      ApplicationCeoCriterionCode,
      NoticeOfIntentSubtype,
    ]),
    ApplicationModule,
    NoticeOfIntentModule,
    NoticeOfIntentDecisionModule,
    forwardRef(() => ApplicationDecisionModule),
    forwardRef(() => PlanningReviewModule),
    forwardRef(() => CovenantModule),
  ],
  controllers: [
    HolidayController,
    LocalGovernmentController,
    ApplicationCeoCriterionController,
    UnarchiveCardController,
    NoiSubtypeController,
  ],
  providers: [
    HolidayService,
    ApplicationCeoCriterionService,
    UnarchiveCardService,
    NoiSubtypeService,
  ],
})
export class AdminModule {}

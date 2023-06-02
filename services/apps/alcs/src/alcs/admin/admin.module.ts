import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { CovenantModule } from '../covenant/covenant.module';
import { CeoCriterionCode } from '../decision/ceo-criterion/ceo-criterion.entity';
import { DecisionModule } from '../decision/decision.module';
import { NoticeOfIntentSubtype } from '../notice-of-intent/notice-of-intent-subtype.entity';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { CeoCriterionController } from './ceo-criterion/ceo-criterion.controller';
import { CeoCriterionService } from './ceo-criterion/ceo-criterion.service';
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
      CeoCriterionCode,
      NoticeOfIntentSubtype,
    ]),
    ApplicationModule,
    forwardRef(() => DecisionModule),
    forwardRef(() => PlanningReviewModule),
    forwardRef(() => CovenantModule),
  ],
  controllers: [
    HolidayController,
    LocalGovernmentController,
    CeoCriterionController,
    UnarchiveCardController,
    NoiSubtypeController,
  ],
  providers: [
    HolidayService,
    CeoCriterionService,
    UnarchiveCardService,
    NoiSubtypeService,
  ],
})
export class AdminModule {}

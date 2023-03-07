import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from '../application/application.module';
import { CovenantModule } from '../covenant/covenant.module';
import { CeoCriterionCode } from '../decision/application-decision/ceo-criterion/ceo-criterion.entity';
import { DecisionModule } from '../decision/decision.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { CeoCriterionController } from './ceo-criterion/ceo-criterion.controller';
import { CeoCriterionService } from './ceo-criterion/ceo-criterion.service';
import { HolidayController } from './holiday/holiday.controller';
import { HolidayEntity } from './holiday/holiday.entity';
import { HolidayService } from './holiday/holiday.service';
import { LocalGovernmentController } from './local-government/local-government.controller';
import { UnarchiveCardController } from './unarchive-card/unarchive-card.controller';
import { UnarchiveCardService } from './unarchive-card/unarchive-card.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HolidayEntity, CeoCriterionCode]),
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
  ],
  providers: [HolidayService, CeoCriterionService, UnarchiveCardService],
})
export class AdminModule {}

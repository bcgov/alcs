import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationDecisionConditionType } from '../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionMakerCode } from '../application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { CovenantModule } from '../covenant/covenant.module';
import { ApplicationCeoCriterionCode } from '../application-decision/application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { NoticeOfIntentDecisionModule } from '../notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentSubtype } from '../notice-of-intent/notice-of-intent-subtype.entity';
import { NoticeOfIntentModule } from '../notice-of-intent/notice-of-intent.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { ApplicationCeoCriterionController } from './application-ceo-criterion/application-ceo-criterion.controller';
import { ApplicationCeoCriterionService } from './application-ceo-criterion/application-ceo-criterion.service';
import { ApplicationDecisionConditionTypesController } from './application-decision-condition-types/application-decision-condition-types.controller';
import { ApplicationDecisionConditionTypesService } from './application-decision-condition-types/application-decision-condition-types.service';
import { ApplicationDecisionMakerController } from './application-decision-maker/application-decision-maker.controller';
import { ApplicationDecisionMakerService } from './application-decision-maker/application-decision-maker.service';
import { BoardManagementController } from './board-management/board-management.controller';
import { CardStatusController } from './card-status/card-status.controller';
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
      ApplicationDecisionMakerCode,
      NoticeOfIntentSubtype,
      ApplicationDecisionConditionType,
    ]),
    ApplicationModule,
    forwardRef(() => ApplicationDecisionModule),
    forwardRef(() => PlanningReviewModule),
    forwardRef(() => CovenantModule),
    NoticeOfIntentModule,
    NoticeOfIntentDecisionModule,
    CardModule,
    BoardModule,
  ],
  controllers: [
    HolidayController,
    LocalGovernmentController,
    ApplicationCeoCriterionController,
    UnarchiveCardController,
    NoiSubtypeController,
    ApplicationDecisionMakerController,
    ApplicationDecisionConditionTypesController,
    CardStatusController,
    BoardManagementController,
  ],
  providers: [
    HolidayService,
    ApplicationCeoCriterionService,
    ApplicationDecisionMakerService,
    UnarchiveCardService,
    NoiSubtypeService,
    ApplicationDecisionConditionTypesService,
  ],
})
export class AdminModule {}

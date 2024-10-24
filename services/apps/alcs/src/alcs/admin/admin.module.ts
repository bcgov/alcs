import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from '../../common/entities/configuration.entity';
import { ApplicationCeoCriterionCode } from '../application-decision/application-ceo-criterion/application-ceo-criterion.entity';
import { ApplicationDecisionConditionType } from '../application-decision/application-decision-condition/application-decision-condition-code.entity';
import { ApplicationDecisionMakerCode } from '../application-decision/application-decision-maker/application-decision-maker.entity';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { ApplicationModule } from '../application/application.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { NoticeOfIntentDecisionModule } from '../notice-of-intent-decision/notice-of-intent-decision.module';
import { NoticeOfIntentSubtype } from '../notice-of-intent/notice-of-intent-subtype.entity';
import { NoticeOfIntentModule } from '../notice-of-intent/notice-of-intent.module';
import { NotificationModule } from '../notification/notification.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { ApplicationCeoCriterionController } from './application-ceo-criterion/application-ceo-criterion.controller';
import { ApplicationCeoCriterionService } from './application-ceo-criterion/application-ceo-criterion.service';
import { ApplicationDecisionConditionTypesController } from './application-decision-condition-types/application-decision-condition-types.controller';
import { ApplicationDecisionConditionTypesService } from './application-decision-condition-types/application-decision-condition-types.service';
import { ApplicationDecisionMakerController } from './application-decision-maker/application-decision-maker.controller';
import { ApplicationDecisionMakerService } from './application-decision-maker/application-decision-maker.service';
import { BoardManagementController } from './board-management/board-management.controller';
import { CardStatusController } from './card-status/card-status.controller';
import { ConfigurationController } from './configuration/configuration.controller';
import { ConfigurationService } from './configuration/configuration.service';
import { HolidayController } from './holiday/holiday.controller';
import { HolidayEntity } from './holiday/holiday.entity';
import { HolidayService } from './holiday/holiday.service';
import { LocalGovernmentController } from './local-government/local-government.controller';
import { NoiSubtypeController } from './noi-subtype/noi-subtype.controller';
import { NoiSubtypeService } from './noi-subtype/noi-subtype.service';
import { UnarchiveCardController } from './unarchive-card/unarchive-card.controller';
import { UnarchiveCardService } from './unarchive-card/unarchive-card.service';
import { TagCategoryService } from './tag-category/tag-category.service';
import { TagCategoryController } from './tag-category/tag-category.controller';
import { TagCategory } from './tag-category/tag-category.entity';
import { Tag } from './tag/tag.entity';
import { TagController } from './tag/tag.controller';
import { TagService } from './tag/tag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HolidayEntity,
      ApplicationCeoCriterionCode,
      ApplicationDecisionMakerCode,
      NoticeOfIntentSubtype,
      ApplicationDecisionConditionType,
      Configuration,
      TagCategory,
      Tag,
    ]),
    ApplicationModule,
    NoticeOfIntentModule,
    NoticeOfIntentDecisionModule,
    forwardRef(() => ApplicationDecisionModule),
    forwardRef(() => PlanningReviewModule),
    NoticeOfIntentModule,
    NoticeOfIntentDecisionModule,
    CardModule,
    BoardModule,
    NotificationModule,
    InquiryModule,
  ],
  controllers: [
    HolidayController,
    LocalGovernmentController,
    ApplicationCeoCriterionController,
    UnarchiveCardController,
    NoiSubtypeController,
    ApplicationDecisionMakerController,
    TagCategoryController,
    TagController,
    ApplicationDecisionConditionTypesController,
    CardStatusController,
    BoardManagementController,
    ConfigurationController,
  ],
  providers: [
    HolidayService,
    ApplicationCeoCriterionService,
    ApplicationDecisionMakerService,
    TagCategoryService,
    TagService,
    UnarchiveCardService,
    NoiSubtypeService,
    ApplicationDecisionConditionTypesService,
    ConfigurationService,
  ],
  exports: [HolidayService],
})
export class AdminModule {}

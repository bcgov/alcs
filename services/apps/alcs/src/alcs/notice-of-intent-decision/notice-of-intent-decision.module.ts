import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentDecisionProfile } from '../../common/automapper/notice-of-intent-decision.automapper.profile';
import { DocumentModule } from '../../document/document.module';
import { NoticeOfIntentSubmissionModule } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { NoticeOfIntentSubmissionStatusModule } from '../notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.module';
import { NoticeOfIntentModule } from '../notice-of-intent/notice-of-intent.module';
import { NoticeOfIntentDecisionComponentType } from './notice-of-intent-decision-component/notice-of-intent-decision-component-type.entity';
import { NoticeOfIntentDecisionComponentController } from './notice-of-intent-decision-component/notice-of-intent-decision-component.controller';
import { NoticeOfIntentDecisionComponent } from './notice-of-intent-decision-component/notice-of-intent-decision-component.entity';
import { NoticeOfIntentDecisionComponentService } from './notice-of-intent-decision-component/notice-of-intent-decision-component.service';
import { NoticeOfIntentDecisionConditionType } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-code.entity';
import { NoticeOfIntentDecisionConditionController } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition.controller';
import { NoticeOfIntentDecisionCondition } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition.entity';
import { NoticeOfIntentDecisionConditionService } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';
import { NoticeOfIntentDecisionDocument } from './notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from './notice-of-intent-decision-outcome.entity';
import { NoticeOfIntentDecisionV2Controller } from './notice-of-intent-decision-v2/notice-of-intent-decision-v2.controller';
import { NoticeOfIntentDecisionV2Service } from './notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecision } from './notice-of-intent-decision.entity';
import { NoticeOfIntentModificationOutcomeType } from './notice-of-intent-modification/notice-of-intent-modification-outcome-type/notice-of-intent-modification-outcome-type.entity';
import { NoticeOfIntentModificationController } from './notice-of-intent-modification/notice-of-intent-modification.controller';
import { NoticeOfIntentModification } from './notice-of-intent-modification/notice-of-intent-modification.entity';
import { NoticeOfIntentModificationService } from './notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDecisionConditionDate } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-date/notice-of-intent-decision-condition-date.entity';
import { NoticeOfIntentDecisionConditionDateService } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-date/notice-of-intent-decision-condition-date.service';
import { NoticeOfIntentDecisionConditionDateController } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-date/notice-of-intent-decision-condition-date.controller';
import { User } from '../../user/user.entity';
import { NoticeOfIntentDecisionConditionCard } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.entity';
import { NoticeOfIntentDecisionConditionCardService } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.service';
import { NoticeOfIntentDecisionConditionCardController } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.controller';
import { NoticeOfIntentDecisionConditionFinancialInstrument } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.entity';
import { NoticeOfIntentDecisionConditionFinancialInstrumentService } from './notice-of-intent-decision-condition/notice-of-intent-decision-condition-financial-instrument/notice-of-intent-decision-condition-financial-instrument.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoticeOfIntentDecisionOutcome,
      NoticeOfIntentDecision,
      NoticeOfIntentDecisionDocument,
      NoticeOfIntentModification,
      NoticeOfIntentModificationOutcomeType,
      NoticeOfIntentDecisionComponent,
      NoticeOfIntentDecisionComponentType,
      NoticeOfIntentDecisionCondition,
      NoticeOfIntentDecisionConditionType,
      NoticeOfIntentDecisionConditionDate,
      NoticeOfIntentDecisionConditionCard,
      NoticeOfIntentDecisionConditionFinancialInstrument,
      User,
    ]),
    forwardRef(() => BoardModule),
    forwardRef(() => CardModule),
    DocumentModule,
    forwardRef(() => NoticeOfIntentModule),
    NoticeOfIntentSubmissionStatusModule,
    forwardRef(() => NoticeOfIntentSubmissionModule),
  ],
  providers: [
    NoticeOfIntentDecisionV2Service,
    NoticeOfIntentDecisionComponentService,
    NoticeOfIntentDecisionConditionService,
    NoticeOfIntentDecisionConditionDateService,
    NoticeOfIntentDecisionProfile,
    NoticeOfIntentModificationService,
    NoticeOfIntentDecisionConditionCardService,
    NoticeOfIntentDecisionConditionFinancialInstrumentService,
  ],
  controllers: [
    NoticeOfIntentDecisionV2Controller,
    NoticeOfIntentModificationController,
    NoticeOfIntentDecisionComponentController,
    NoticeOfIntentDecisionConditionController,
    NoticeOfIntentDecisionConditionDateController,
    NoticeOfIntentDecisionConditionCardController,
  ],
  exports: [
    NoticeOfIntentModificationService,
    NoticeOfIntentDecisionV2Service,
    NoticeOfIntentDecisionConditionCardService,
    NoticeOfIntentModificationService,
    NoticeOfIntentDecisionConditionCardService,
  ],
})
export class NoticeOfIntentDecisionModule {}

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentDecisionProfile } from '../../common/automapper/notice-of-intent-decision.automapper.profile';
import { DocumentModule } from '../../document/document.module';
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
import { NoticeOfIntentDecisionV1Controller } from './notice-of-intent-decision-v1/notice-of-intent-decision-v1.controller';
import { NoticeOfIntentDecisionV1Service } from './notice-of-intent-decision-v1/notice-of-intent-decision-v1.service';
import { NoticeOfIntentDecisionV2Controller } from './notice-of-intent-decision-v2/notice-of-intent-decision-v2.controller';
import { NoticeOfIntentDecisionV2Service } from './notice-of-intent-decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecision } from './notice-of-intent-decision.entity';
import { NoticeOfIntentModificationOutcomeType } from './notice-of-intent-modification/notice-of-intent-modification-outcome-type/notice-of-intent-modification-outcome-type.entity';
import { NoticeOfIntentModificationController } from './notice-of-intent-modification/notice-of-intent-modification.controller';
import { NoticeOfIntentModification } from './notice-of-intent-modification/notice-of-intent-modification.entity';
import { NoticeOfIntentModificationService } from './notice-of-intent-modification/notice-of-intent-modification.service';

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
    ]),
    forwardRef(() => BoardModule),
    CardModule,
    DocumentModule,
    forwardRef(() => NoticeOfIntentModule),
    NoticeOfIntentSubmissionStatusModule,
  ],
  providers: [
    //These are in the same module, so be careful to import the correct one
    NoticeOfIntentDecisionV1Service,
    NoticeOfIntentDecisionV2Service,
    NoticeOfIntentDecisionComponentService,
    NoticeOfIntentDecisionConditionService,
    NoticeOfIntentDecisionProfile,
    NoticeOfIntentModificationService,
  ],
  controllers: [
    NoticeOfIntentDecisionV1Controller,
    NoticeOfIntentDecisionV2Controller,
    NoticeOfIntentModificationController,
    NoticeOfIntentDecisionComponentController,
    NoticeOfIntentDecisionConditionController,
  ],
  exports: [
    NoticeOfIntentModificationService,
    NoticeOfIntentDecisionV1Service,
    NoticeOfIntentDecisionV2Service,
  ],
})
export class NoticeOfIntentDecisionModule {}

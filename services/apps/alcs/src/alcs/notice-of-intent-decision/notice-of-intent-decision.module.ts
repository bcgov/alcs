import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeOfIntentDecisionProfile } from '../../common/automapper/notice-of-intent-decision.automapper.profile';
import { DocumentModule } from '../../document/document.module';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { NoticeOfIntentModule } from '../notice-of-intent/notice-of-intent.module';
import { NoticeOfIntentDecisionDocument } from './notice-of-intent-decision-document/notice-of-intent-decision-document.entity';
import { NoticeOfIntentDecisionOutcome } from './notice-of-intent-decision-outcome.entity';
import { NoticeOfIntentDecision } from './notice-of-intent-decision.entity';
import { NoticeOfIntentDecisionController } from './notice-of-intent-decision.controller';
import { NoticeOfIntentDecisionService } from './notice-of-intent-decision.service';
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
    ]),
    forwardRef(() => BoardModule),
    CardModule,
    DocumentModule,
    NoticeOfIntentModule,
  ],
  providers: [
    NoticeOfIntentDecisionService,
    NoticeOfIntentDecisionProfile,
    NoticeOfIntentModificationService,
  ],
  controllers: [
    NoticeOfIntentDecisionController,
    NoticeOfIntentModificationController,
  ],
  exports: [NoticeOfIntentModificationService, NoticeOfIntentDecisionService],
})
export class NoticeOfIntentDecisionModule {}

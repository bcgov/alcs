import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningReviewDecisionProfile } from '../../../common/automapper/planning-review-decision.automapper.profile';
import { DocumentModule } from '../../../document/document.module';
import { PlanningReviewModule } from '../planning-review.module';
import { PlanningReviewDecisionDocument } from './planning-review-decision-document/planning-review-decision-document.entity';
import { PlanningReviewDecisionOutcomeCode } from './planning-review-decision-outcome.entity';
import { PlanningReviewDecisionController } from './planning-review-decision.controller';
import { PlanningReviewDecision } from './planning-review-decision.entity';
import { PlanningReviewDecisionService } from './planning-review-decision.service';

@Module({
  imports: [
    PlanningReviewModule,
    DocumentModule,
    TypeOrmModule.forFeature([
      PlanningReviewDecision,
      PlanningReviewDecisionDocument,
      PlanningReviewDecisionOutcomeCode,
    ]),
  ],
  providers: [PlanningReviewDecisionService, PlanningReviewDecisionProfile],
  controllers: [PlanningReviewDecisionController],
  exports: [PlanningReviewDecisionService],
})
export class PlanningReviewDecisionModule {}

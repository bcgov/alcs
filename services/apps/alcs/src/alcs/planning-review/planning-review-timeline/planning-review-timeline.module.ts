import { Module } from '@nestjs/common';
import { PlanningReviewDecisionModule } from '../planning-review-decision/planning-review-decision.module';
import { PlanningReviewModule } from '../planning-review.module';
import { PlanningReviewTimelineController } from './planning-review-timeline.controller';
import { PlanningReviewTimelineService } from './planning-review-timeline.service';

@Module({
  imports: [PlanningReviewModule, PlanningReviewDecisionModule],
  providers: [PlanningReviewTimelineService],
  controllers: [PlanningReviewTimelineController],
})
export class PlanningReviewTimelineModule {}

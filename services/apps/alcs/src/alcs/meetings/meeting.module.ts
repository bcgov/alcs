import { Module } from '@nestjs/common';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { ApplicationModule } from '../application/application.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { DecisionMeetingController } from './decision-meeting.controller';

@Module({
  imports: [ApplicationModule, ApplicationDecisionModule, PlanningReviewModule],
  providers: [],
  controllers: [DecisionMeetingController],
  exports: [],
})
export class MeetingModule {}

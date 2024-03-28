import { Module } from '@nestjs/common';
import { CommissionerProfile } from '../../common/automapper/commissioner.automapper.profile';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { ApplicationModule } from '../application/application.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { CommissionerController } from './commissioner.controller';

@Module({
  imports: [ApplicationModule, ApplicationDecisionModule, PlanningReviewModule],
  providers: [CommissionerProfile],
  controllers: [CommissionerController],
})
export class CommissionerModule {}

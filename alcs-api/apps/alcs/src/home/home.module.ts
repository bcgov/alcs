import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { ApplicationSubtaskProfile } from '../common/automapper/application-subtask.automapper.profile';
import { CovenantModule } from '../covenant/covenant.module';
import { DecisionModule } from '../decision/decision.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { UserModule } from '../user/user.module';
import { HomeController } from './home.controller';

@Module({
  imports: [
    ApplicationModule,
    UserModule,
    PlanningReviewModule,
    CovenantModule,
    DecisionModule,
  ],
  providers: [ApplicationSubtaskProfile],
  controllers: [HomeController],
})
export class HomeModule {}

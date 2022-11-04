import { Module } from '@nestjs/common';
import { ApplicationAmendmentModule } from '../application-amendment/application-amendment.module';
import { ApplicationReconsiderationModule } from '../application-reconsideration/application-reconsideration.module';
import { ApplicationModule } from '../application/application.module';
import { ApplicationSubtaskProfile } from '../common/automapper/application-subtask.automapper.profile';
import { CovenantModule } from '../covenant/covenant.module';
import { PlanningReviewModule } from '../planning-review/planning-review.module';
import { UserModule } from '../user/user.module';
import { HomeController } from './home.controller';

@Module({
  imports: [
    ApplicationModule,
    UserModule,
    ApplicationReconsiderationModule,
    PlanningReviewModule,
    ApplicationAmendmentModule,
    CovenantModule,
  ],
  providers: [ApplicationSubtaskProfile],
  controllers: [HomeController],
})
export class HomeModule {}

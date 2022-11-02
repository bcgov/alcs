import { Module } from '@nestjs/common';
import { ApplicationAmendmentModule } from '../application-amendment/application-amendment.module';
import { ApplicationReconsiderationModule } from '../application-reconsideration/application-reconsideration.module';
import { ApplicationModule } from '../application/application.module';
import { CommissionerProfile } from '../common/automapper/commissioner.automapper.profile';
import { CommissionerController } from './commissioner.controller';

@Module({
  imports: [
    ApplicationModule,
    ApplicationAmendmentModule,
    ApplicationReconsiderationModule,
  ],
  providers: [CommissionerProfile],
  controllers: [CommissionerController],
})
export class CommissionerModule {}

import { Module } from '@nestjs/common';
import { CommissionerProfile } from '../../common/automapper/commissioner.automapper.profile';
import { ApplicationModule } from '../application/application.module';
import { ApplicationDecisionModule } from '../application-decision/application-decision.module';
import { CommissionerController } from './commissioner.controller';

@Module({
  imports: [ApplicationModule, ApplicationDecisionModule],
  providers: [CommissionerProfile],
  controllers: [CommissionerController],
})
export class CommissionerModule {}

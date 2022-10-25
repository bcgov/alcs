import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { CommissionerProfile } from '../common/automapper/commissioner.automapper.profile';
import { CommissionerController } from './commissioner.controller';

@Module({
  imports: [ApplicationModule],
  providers: [CommissionerProfile],
  controllers: [CommissionerController],
})
export class CommissionerModule {}

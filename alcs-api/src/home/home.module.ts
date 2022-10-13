import { Module } from '@nestjs/common';
import { ApplicationReconsiderationModule } from '../application-reconsideration/application-reconsideration.module';
import { ApplicationModule } from '../application/application.module';
import { ApplicationSubtaskProfile } from '../common/automapper/application-subtask.automapper.profile';
import { UserModule } from '../user/user.module';
import { HomeController } from './home.controller';

@Module({
  imports: [ApplicationModule, UserModule, ApplicationReconsiderationModule],
  providers: [ApplicationSubtaskProfile],
  controllers: [HomeController],
})
export class HomeModule {}

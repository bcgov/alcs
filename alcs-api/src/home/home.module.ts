import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { ApplicationSubtaskProfile } from '../common/automapper/application-subtask.automapper.profile';
import { UserModule } from '../user/user.module';
import { HomeController } from './home.controller';

@Module({
  imports: [ApplicationModule, UserModule],
  providers: [ApplicationSubtaskProfile],
  controllers: [HomeController],
})
export class HomeModule {}

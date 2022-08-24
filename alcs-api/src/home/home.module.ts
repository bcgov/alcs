import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { UserModule } from '../user/user.module';
import { HomeController } from './home.controller';

@Module({
  imports: [ApplicationModule, UserModule],
  controllers: [HomeController],
})
export class HomeModule {}

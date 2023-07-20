import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationLocalGovernment } from '../alcs/application/application-code/application-local-government/application-local-government.entity';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { EmailModule } from '../providers/email/email.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationLocalGovernment, User]),
    EmailModule,
  ],
  providers: [UserService, UserProfile],
  exports: [UserService, EmailModule],
  controllers: [UserController],
})
export class UserModule {}

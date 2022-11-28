import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserProfile],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}

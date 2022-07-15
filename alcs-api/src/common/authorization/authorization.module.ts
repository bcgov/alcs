import { Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { UserService } from '../../user/user.service';

@Module({
  imports: [UserModule],
  providers: [],
  exports: [UserService],
})
export class AuthorizationModule {}

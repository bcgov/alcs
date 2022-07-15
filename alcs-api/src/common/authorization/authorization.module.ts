import { DynamicModule, Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { UserService } from '../../user/user.service';

@Module({})
export class AuthorizationModule {
  static register(): DynamicModule {
    return {
      imports: [UserModule],
      module: AuthorizationModule,
      exports: [UserService],
    };
  }
}

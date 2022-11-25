import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { ClsModule } from 'nestjs-cls';
import { KeycloakConfigService } from '../../providers/keycloak/keycloak-config.service';
import { UserModule } from '../../user/user.module';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';

@Global()
@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useClass: KeycloakConfigService,
    }),
    HttpModule,
    UserModule,
    ClsModule,
  ],
  providers: [AuthorizationService],
  controllers: [AuthorizationController],
  exports: [KeycloakConnectModule],
})
export class AuthorizationModule {}

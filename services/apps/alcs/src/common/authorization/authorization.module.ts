import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
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
    UserModule,
    HttpModule,
  ],
  providers: [AuthorizationService],
  controllers: [AuthorizationController],
  exports: [KeycloakConnectModule, UserModule],
})
export class AuthorizationModule {}

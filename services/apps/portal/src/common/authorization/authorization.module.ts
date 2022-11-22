import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { KeycloakConfigService } from '../../providers/keycloak/keycloak-config.service';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';

@Global()
@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useClass: KeycloakConfigService,
    }),
    HttpModule,
  ],
  providers: [AuthorizationService],
  controllers: [AuthorizationController],
  exports: [KeycloakConnectModule],
})
export class AuthorizationModule {}

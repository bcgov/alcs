import { Global, Module } from '@nestjs/common';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { KeycloakConfigService } from '../../providers/keycloak/keycloak-config.service';
import { UserModule } from '../../user/user.module';

@Global()
@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useClass: KeycloakConfigService,
    }),
    UserModule,
  ],
  providers: [],
  exports: [KeycloakConnectModule, UserModule],
})
export class AuthorizationModule {}

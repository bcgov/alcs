import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { Inject, Injectable } from '@nestjs/common';
import {
  KeycloakConnectOptions,
  KeycloakConnectOptionsFactory,
  TokenValidation,
} from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  createKeycloakConnectOptions(): KeycloakConnectOptions {
    return {
      authServerUrl: this.config.get<string>('KEYCLOAK.AUTH_SERVER_URL'),
      realm: this.config.get<string>('KEYCLOAK.REALM'),
      secret: this.config.get<string>('PORTAL.KEYCLOAK.SECRET'),
      'ssl-required': 'external',
      resource: this.config.get<string>('PORTAL.KEYCLOAK.CLIENT_ID'),
      'confidential-port': 0,
      tokenValidation: TokenValidation.OFFLINE,
      verifyTokenAudience: true,
    };
  }
}

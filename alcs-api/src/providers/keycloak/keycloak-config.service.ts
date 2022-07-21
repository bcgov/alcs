import { Inject, Injectable } from '@nestjs/common';
import {
  KeycloakConnectOptions,
  KeycloakConnectOptionsFactory,
} from 'nest-keycloak-connect';
import { CONFIG_TOKEN, IConfig } from '../../common/config/config.module';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
  constructor(@Inject(CONFIG_TOKEN) private config: IConfig) {}

  createKeycloakConnectOptions(): KeycloakConnectOptions {
    return {
      authServerUrl: this.config.get<string>('KEYCLOAK.AUTH_SERVER_URL'),
      realm: this.config.get<string>('KEYCLOAK.REALM'),
      secret: this.config.get<string>('KEYCLOAK.SECRET'),
      logLevels: ['verbose'],
      'ssl-required': 'external',
      resource: this.config.get<string>('KEYCLOAK.CLIENT_ID'),
      'confidential-port': 0,
      useNestLogger: true,
    };
  }
}

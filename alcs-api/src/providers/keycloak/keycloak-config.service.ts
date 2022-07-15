import { Injectable } from '@nestjs/common';
import * as config from 'config';
import {
  KeycloakConnectOptions,
  KeycloakConnectOptionsFactory,
} from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
  createKeycloakConnectOptions(): KeycloakConnectOptions {
    return {
      authServerUrl: config.get<string>('KEYCLOAK.AUTH_SERVER_URL'),
      realm: config.get<string>('KEYCLOAK.REALM'),
      clientId: config.get<string>('KEYCLOAK.CLIENT_ID'),
      secret: config.get<string>('KEYCLOAK.SECRET'),
      logLevels: ['verbose'],
      useNestLogger: true,
    };
  }
}

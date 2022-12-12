import { ConfigModule } from '@app/common/config/config.module';
import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakConnectConfig } from 'nest-keycloak-connect/interface/keycloak-connect-options.interface';
import { KeycloakConfigService } from './keycloak-config.service';
import * as config from 'config';

describe('KeycloakConfigService', () => {
  let service: KeycloakConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [KeycloakConfigService],
    }).compile();

    service = module.get<KeycloakConfigService>(KeycloakConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a config object', () => {
    const keyCloakConfig =
      service.createKeycloakConnectOptions() as KeycloakConnectConfig;
    expect(keyCloakConfig.realm).toBe(config.get('KEYCLOAK.REALM'));
  });
});

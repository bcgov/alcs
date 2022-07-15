import { Test, TestingModule } from '@nestjs/testing';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_LOGGER,
} from 'nest-keycloak-connect';
import { KeycloakMultiTenantService } from 'nest-keycloak-connect/services/keycloak-multitenant.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  HealthCheckDbDto,
  HealthCheckDto,
} from './healthcheck/healthcheck.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { repositoryMockFactory } from './common/utils/mockTypes';
import { UserService } from './user/user.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const appModule: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: getRepositoryToken(HealthCheck),
          useFactory: repositoryMockFactory,
        },
        {
          provide: KEYCLOAK_INSTANCE,
          useValue: {},
        },
        {
          provide: KEYCLOAK_CONNECT_OPTIONS,
          useValue: {},
        },
        {
          provide: KEYCLOAK_LOGGER,
          useValue: {},
        },
        KeycloakMultiTenantService,
        {
          provide: UserService,
          useValue: {},
        },
      ],
    }).compile();

    appService = appModule.get<AppService>(AppService);
    appController = appModule.get<AppController>(AppController);
  });

  describe('root', () => {
    it('AppController should return HealthCheckDto', async () => {
      const dbDto: HealthCheckDbDto = {
        read: true,
        write: false,
      };
      const result: HealthCheckDto = { alive: true, db: dbDto };

      jest
        .spyOn(appService, 'getHealthStatus')
        .mockImplementation(async () => result);

      expect(await appController.getHealthStatus()).toBe(result);
    });
  });
});

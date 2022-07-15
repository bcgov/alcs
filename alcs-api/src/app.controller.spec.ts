import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  HealthCheckDbDto,
  HealthCheckDto,
} from './healthcheck/healthcheck.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HealthCheck } from './healthcheck/healthcheck.entity';
import { repositoryMockFactory } from './common/utils/test-helpers/mockTypes';

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

import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { mockKeyCloakProviders } from './common/utils/test-helpers/mockTypes';
import {
  HealthCheckDbDto,
  HealthCheckDto,
} from './healthcheck/healthcheck.dto';

describe('AppController', () => {
  let appController: AppController;
  let mockAppService: DeepMocked<AppService>;

  beforeEach(async () => {
    mockAppService = createMock<AppService>();

    const appModule: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    appController = appModule.get<AppController>(AppController);
  });

  describe('root', () => {
    it('AppController should call through to AppService', async () => {
      const dbDto: HealthCheckDbDto = {
        read: true,
        write: false,
      };
      const result: HealthCheckDto = { alive: true, db: dbDto };
      mockAppService.getHealthStatus.mockResolvedValue(result);
      expect(await appController.getHealthStatus()).toBe(result);
    });
  });
});

import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { AlcsController } from './alcs.controller';
import { AlcsService } from './alcs.service';
import { mockKeyCloakProviders } from './common/utils/test-helpers/mockTypes';
import {
  HealthCheckDbDto,
  HealthCheckDto,
} from './healthcheck/healthcheck.dto';

describe('AppController', () => {
  let appController: AlcsController;
  let mockAppService: DeepMocked<AlcsService>;

  beforeEach(async () => {
    mockAppService = createMock<AlcsService>();

    const appModule: TestingModule = await Test.createTestingModule({
      controllers: [AlcsController],
      providers: [
        {
          provide: AlcsService,
          useValue: mockAppService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    appController = appModule.get<AlcsController>(AlcsController);
  });

  describe('root', () => {
    it('AlcsController should call through to AlcsService', async () => {
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

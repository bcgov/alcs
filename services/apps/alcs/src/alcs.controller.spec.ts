import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { AlcsController } from './alcs.controller';
import { AlcsService } from './alcs.service';
import { mockKeyCloakProviders } from '../test/mocks/mockTypes';
import {
  HealthCheckDbDto,
  HealthCheckDto,
} from './healthcheck/healthcheck.dto';

describe('AlcsController', () => {
  let alcsController: AlcsController;
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

    alcsController = appModule.get<AlcsController>(AlcsController);
  });

  describe('root', () => {
    it('AlcsController should call through to AlcsService', async () => {
      const dbDto: HealthCheckDbDto = {
        read: true,
        write: false,
      };
      const result: HealthCheckDto = { alive: true, db: dbDto };
      mockAppService.getHealthStatus.mockResolvedValue(result);
      expect(await alcsController.getHealthStatus()).toBe(result);
    });
  });
});

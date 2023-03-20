import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { mockKeyCloakProviders } from '../test/mocks/mockTypes';
import {
  HealthCheckDbDto,
  HealthCheckDto,
} from './healthcheck/healthcheck.dto';

describe('AlcsController', () => {
  let alcsController: MainController;
  let mockAppService: DeepMocked<MainService>;

  beforeEach(async () => {
    mockAppService = createMock<MainService>();

    const appModule: TestingModule = await Test.createTestingModule({
      controllers: [MainController],
      providers: [
        {
          provide: MainService,
          useValue: mockAppService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    alcsController = appModule.get<MainController>(MainController);
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

import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from '../../common/maintenance/maintenance.service';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';

describe('MaintenanceController', () => {
  let controller: MaintenanceController;
  let mockMaintenanceService: DeepMocked<MaintenanceService>;

  beforeEach(async () => {
    mockMaintenanceService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [
        { provide: MaintenanceService, useValue: mockMaintenanceService },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<MaintenanceController>(MaintenanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service for getting maintenance banner', async () => {
    mockMaintenanceService.getBanner.mockResolvedValue({} as any);

    await controller.getMaintenanceBanner();

    expect(mockMaintenanceService.getBanner).toHaveBeenCalledTimes(1);
  });
});

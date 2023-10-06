import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { PublicAutomapperProfile } from '../../common/automapper/public.automapper.profile';
import { PublicApplicationService } from './public-application.service';
import { PublicController } from './public.controller';

describe('PublicSearchController', () => {
  let controller: PublicController;
  let mockAppService: DeepMocked<PublicApplicationService>;

  beforeEach(async () => {
    mockAppService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PublicApplicationService,
          useValue: mockAppService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [PublicController],
    }).compile();

    controller = module.get<PublicController>(PublicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service for loading an application', async () => {
    mockAppService.getPublicApplicationData.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getApplication(fileId);

    expect(mockAppService.getPublicApplicationData).toHaveBeenCalledTimes(1);
  });
});

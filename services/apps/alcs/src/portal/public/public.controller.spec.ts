import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { PublicApplicationService } from './application/public-application.service';
import { PublicNoticeOfIntentService } from './notice-of-intent/public-notice-of-intent.service';
import { PublicController } from './public.controller';

describe('PublicController', () => {
  let controller: PublicController;
  let mockAppService: DeepMocked<PublicApplicationService>;
  let mockNOIService: DeepMocked<PublicNoticeOfIntentService>;

  beforeEach(async () => {
    mockAppService = createMock();
    mockNOIService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PublicApplicationService,
          useValue: mockAppService,
        },
        {
          provide: PublicNoticeOfIntentService,
          useValue: mockNOIService,
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
    mockAppService.getPublicData.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getApplication(fileId);

    expect(mockAppService.getPublicData).toHaveBeenCalledTimes(1);
  });
});

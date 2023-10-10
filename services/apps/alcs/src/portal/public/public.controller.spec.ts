import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { PublicApplicationService } from './application/public-application.service';
import { PublicNoticeOfIntentService } from './notice-of-intent/public-notice-of-intent.service';
import { PublicNotificationService } from './notification/public-notification.service';
import { PublicController } from './public.controller';

describe('PublicController', () => {
  let controller: PublicController;
  let mockAppService: DeepMocked<PublicApplicationService>;
  let mockNOIService: DeepMocked<PublicNoticeOfIntentService>;
  let mockNotificationService: DeepMocked<PublicNotificationService>;

  beforeEach(async () => {
    mockAppService = createMock();
    mockNOIService = createMock();
    mockNotificationService = createMock();

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
          provide: PublicNotificationService,
          useValue: mockNotificationService,
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

  it('should call through to service for loading a notice of intent', async () => {
    mockNOIService.getPublicData.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getNoticeOfIntent(fileId);

    expect(mockNOIService.getPublicData).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for loading a notification', async () => {
    mockNotificationService.getPublicData.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getNotification(fileId);

    expect(mockNotificationService.getPublicData).toHaveBeenCalledTimes(1);
  });
});

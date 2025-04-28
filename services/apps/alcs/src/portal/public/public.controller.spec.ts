import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { PublicApplicationService } from './application/public-application.service';
import { PublicNoticeOfIntentService } from './notice-of-intent/public-notice-of-intent.service';
import { PublicNotificationService } from './notification/public-notification.service';
import { PublicController } from './public.controller';
import { DocumentService } from '../../document/document.service';

describe('PublicController', () => {
  let controller: PublicController;
  let mockAppService: DeepMocked<PublicApplicationService>;
  let mockNOIService: DeepMocked<PublicNoticeOfIntentService>;
  let mockNotificationService: DeepMocked<PublicNotificationService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockAppService = createMock();
    mockNOIService = createMock();
    mockNotificationService = createMock();
    mockDocumentService = createMock();

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
          provide: DocumentService,
          useValue: mockDocumentService,
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

  it('should call through to service for loading an application document download', async () => {
    mockAppService.getDownloadUrl.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getApplicationDocumentDownload(fileId, '');

    expect(mockAppService.getDownloadUrl).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for loading an application document open', async () => {
    mockAppService.getInlineUrl.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getApplicationDocumentOpen(fileId, '');

    expect(mockAppService.getInlineUrl).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for loading a notice of intent', async () => {
    mockNOIService.getPublicData.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getNoticeOfIntent(fileId);

    expect(mockNOIService.getPublicData).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for loading a notice of intent document download', async () => {
    mockNOIService.getDownloadUrl.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getNoticeOfIntentDocumentDownload(fileId, '');

    expect(mockNOIService.getDownloadUrl).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for loading a notice of intent document open', async () => {
    mockNOIService.getInlineUrl.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getNoticeOfIntentDocumentOpen(fileId, '');

    expect(mockNOIService.getInlineUrl).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for loading a notification', async () => {
    mockNotificationService.getPublicData.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getNotification(fileId);

    expect(mockNotificationService.getPublicData).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for loading a notice of intent document download', async () => {
    mockNotificationService.getDownloadUrl.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getNotificationDocumentDownload(fileId, '');

    expect(mockNotificationService.getDownloadUrl).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for loading a notice of intent document open', async () => {
    mockNotificationService.getInlineUrl.mockResolvedValue({} as any);

    const fileId = 'file-id';
    await controller.getNotificationDocumentOpen(fileId, '');

    expect(mockNotificationService.getInlineUrl).toHaveBeenCalledTimes(1);
  });
});

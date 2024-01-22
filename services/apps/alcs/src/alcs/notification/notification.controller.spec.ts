import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { TrackingService } from '../../common/tracking/tracking.service';
import { NotificationSubmissionService } from '../../portal/notification-submission/notification-submission.service';
import { User } from '../../user/user.entity';
import { NotificationDocumentService } from './notification-document/notification-document.service';
import { NOTIFICATION_STATUS } from './notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from './notification-submission-status/notification-submission-status.service';
import { NotificationController } from './notification.controller';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;
  let mockService: DeepMocked<NotificationService>;
  let mockSubmissionStatusService: DeepMocked<NotificationSubmissionStatusService>;
  let mockSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockDocumentService: DeepMocked<NotificationDocumentService>;
  let mockTrackingService: DeepMocked<TrackingService>;

  beforeEach(async () => {
    mockService = createMock();
    mockSubmissionStatusService = createMock();
    mockSubmissionService = createMock();
    mockDocumentService = createMock();
    mockTrackingService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockService,
        },
        {
          provide: NotificationSubmissionStatusService,
          useValue: mockSubmissionStatusService,
        },
        {
          provide: NotificationDocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: NotificationSubmissionService,
          useValue: mockSubmissionService,
        },
        {
          provide: TrackingService,
          useValue: mockTrackingService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service for get', async () => {
    mockService.getByFileNumber.mockResolvedValue(new Notification());
    mockService.mapToDtos.mockResolvedValue([]);
    mockTrackingService.trackView.mockResolvedValue();

    await controller.get('fileNumber', {
      user: {
        entity: new User(),
      },
    });

    expect(mockService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
    expect(mockTrackingService.trackView).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for search', async () => {
    mockService.searchByFileNumber.mockResolvedValue([new Notification()]);
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.search('fileNumber');

    expect(mockService.searchByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for update', async () => {
    mockService.update.mockResolvedValue(new Notification());
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.update({}, 'fileNumber', {
      user: {
        entity: new User(),
      },
    });

    expect(mockService.update).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for get card', async () => {
    mockService.getByCardUuid.mockResolvedValue(new Notification());
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.getByCard('uuid');

    expect(mockService.getByCardUuid).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to submission service for cancel', async () => {
    mockSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      {} as any,
    );

    await controller.cancel('file-number');

    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledWith('file-number', NOTIFICATION_STATUS.CANCELLED);
  });

  it('should call through to submission service for uncancel', async () => {
    mockSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      {} as any,
    );

    await controller.uncancel('file-number');

    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledWith('file-number', NOTIFICATION_STATUS.CANCELLED, null);
  });
});

import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { NOI_SUBMISSION_STATUS } from '../notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NOTIFICATION_STATUS } from './notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from './notification-submission-status/notification-submission-status.service';
import { NotificationController } from './notification.controller';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;
  let mockService: DeepMocked<NotificationService>;
  let mockSubmissionStatusService: DeepMocked<NotificationSubmissionStatusService>;

  beforeEach(async () => {
    mockService = createMock();
    mockSubmissionStatusService = createMock();

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

    await controller.get('fileNumber');

    expect(mockService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
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

    await controller.update({}, 'fileNumber');

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

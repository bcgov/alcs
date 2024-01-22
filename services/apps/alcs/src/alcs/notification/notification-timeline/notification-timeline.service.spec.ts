import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NOTIFICATION_STATUS } from '../notification-submission-status/notification-status.dto';
import { NotificationSubmissionToSubmissionStatus } from '../notification-submission-status/notification-status.entity';
import { NotificationSubmissionStatusService } from '../notification-submission-status/notification-submission-status.service';
import { Notification } from '../notification.entity';
import { NotificationService } from '../notification.service';
import { NotificationTimelineService } from './notification-timeline.service';

describe('NotificationTimelineService', () => {
  let service: NotificationTimelineService;
  let mockNOIRepo: DeepMocked<Repository<Notification>>;
  let mockNOIService: DeepMocked<NotificationService>;
  let mockNOIStatusService: DeepMocked<NotificationSubmissionStatusService>;

  beforeEach(async () => {
    mockNOIRepo = createMock();
    mockNOIService = createMock();
    mockNOIStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNOIRepo,
        },
        {
          provide: NotificationService,
          useValue: mockNOIService,
        },
        {
          provide: NotificationSubmissionStatusService,
          useValue: mockNOIStatusService,
        },
        NotificationTimelineService,
      ],
    }).compile();

    service = module.get<NotificationTimelineService>(
      NotificationTimelineService,
    );

    mockNOIRepo.findOneOrFail.mockResolvedValue(new Notification());
    mockNOIService.mapToDtos.mockResolvedValue([]);
    mockNOIStatusService.getCurrentStatusesByFileNumber.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return nothing for empty Notification', async () => {
    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
  });

  it('should map Status Events', async () => {
    const sameDate = new Date();
    mockNOIStatusService.getCurrentStatusesByFileNumber.mockResolvedValue([
      new NotificationSubmissionToSubmissionStatus({
        statusType: {
          code: NOTIFICATION_STATUS.IN_PROGRESS,
          weight: 0,
        } as any,
        effectiveDate: sameDate,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(1);
    expect(res[0].htmlText).toEqual('Created - <strong>In Progress</strong>');
  });
});

import { ConfigModule } from '@app/common/config/config.module';
import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { BullConfigService } from '../bullConfig.service';
import {
  EVERYDAY_MIDNIGHT,
  EVERY_15_MINUTES,
  QUEUES,
  SchedulerService,
} from './scheduler.service';

describe('SchedulerService', () => {
  let schedulerService: SchedulerService;
  let mockAppExpiryQueue;
  let mockNotificationCleanUpQueue;
  let mockApplicationStatusEmailsQueue;
  let mockNoticeOfIntentStatusEmailsQueue;

  beforeEach(async () => {
    mockAppExpiryQueue = {
      add: jest.fn(),
      process: jest.fn(),
      empty: jest.fn(),
    };

    mockNotificationCleanUpQueue = {
      add: jest.fn(),
      process: jest.fn(),
      empty: jest.fn(),
    };

    mockApplicationStatusEmailsQueue = {
      add: jest.fn(),
      process: jest.fn(),
      empty: jest.fn(),
    };

    mockNoticeOfIntentStatusEmailsQueue = {
      add: jest.fn(),
      process: jest.fn(),
      empty: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        BullModule.forRootAsync({
          useClass: BullConfigService,
        }),
      ],
      providers: [
        SchedulerService,
        BullConfigService,
        {
          provide: getQueueToken(QUEUES.APP_EXPIRY),
          useValue: mockAppExpiryQueue,
        },
        {
          provide: getQueueToken(QUEUES.CLEANUP_NOTIFICATIONS),
          useValue: mockNotificationCleanUpQueue,
        },
        {
          provide: getQueueToken(QUEUES.APPLICATION_STATUS_EMAILS),
          useValue: mockApplicationStatusEmailsQueue,
        },
        {
          provide: getQueueToken(QUEUES.NOTICE_OF_INTENTS_STATUS_EMAILS),
          useValue: mockNoticeOfIntentStatusEmailsQueue,
        },
      ],
    }).compile();

    schedulerService = module.get<SchedulerService>(SchedulerService);
  });

  it('should be defined', () => {
    expect(schedulerService).toBeDefined();
  });

  //Job Disabled for now
  // it('should call add for scheduleApplicationExpiry', async () => {
  //   await schedulerService.setup();
  //   expect(mockAppExpiryQueue.empty).toBeCalledTimes(1);
  //   expect(mockAppExpiryQueue.add).toBeCalledTimes(1);
  //   expect(mockAppExpiryQueue.add).toBeCalledWith(
  //     {},
  //     { repeat: { cron: MONDAY_TO_FRIDAY_AT_2AM } },
  //   );
  // });

  it('should call add for notification cleanup', async () => {
    await schedulerService.setup();
    expect(mockNotificationCleanUpQueue.empty).toBeCalledTimes(1);
    expect(mockNotificationCleanUpQueue.add).toBeCalledTimes(1);
    expect(mockNotificationCleanUpQueue.add).toBeCalledWith(
      {},
      { repeat: { cron: EVERYDAY_MIDNIGHT } },
    );
  });

  it('should call add for application status email', async () => {
    await schedulerService.setup();
    expect(mockApplicationStatusEmailsQueue.empty).toBeCalledTimes(1);
    expect(mockApplicationStatusEmailsQueue.add).toBeCalledTimes(1);
    expect(mockApplicationStatusEmailsQueue.add).toBeCalledWith(
      {},
      { repeat: { cron: EVERY_15_MINUTES } },
    );
  });

  it('should call add for notice of intent status email', async () => {
    await schedulerService.setup();
    expect(mockNoticeOfIntentStatusEmailsQueue.empty).toBeCalledTimes(1);
    expect(mockNoticeOfIntentStatusEmailsQueue.add).toBeCalledTimes(1);
    expect(mockNoticeOfIntentStatusEmailsQueue.add).toBeCalledWith(
      {},
      { repeat: { cron: EVERY_15_MINUTES } },
    );
  });
});

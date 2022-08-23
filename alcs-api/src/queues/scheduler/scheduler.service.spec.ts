import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../../common/config/config.module';
import { BullConfigService } from '../bullConfig.service';
import {
  EVERYDAY_MIDNIGHT,
  MONDAY_TO_FRIDAY_AT_2AM,
  QUEUES,
  SchedulerService,
} from './scheduler.service';

describe('SchedulerService', () => {
  let schedulerService: SchedulerService;
  let mockAppExpiryQueue;
  let mockNotificationCleanUpQueue;

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
      ],
    }).compile();

    schedulerService = module.get<SchedulerService>(SchedulerService);
  });

  it('should be defined', () => {
    expect(schedulerService).toBeDefined();
  });

  it('should call add for scheduleApplicationExpiry', async () => {
    await schedulerService.setup();
    expect(mockAppExpiryQueue.empty).toBeCalledTimes(1);
    expect(mockAppExpiryQueue.add).toBeCalledTimes(1);
    expect(mockAppExpiryQueue.add).toBeCalledWith(
      {},
      { repeat: { cron: MONDAY_TO_FRIDAY_AT_2AM } },
    );
  });

  it('should call add for notification cleanup', async () => {
    await schedulerService.setup();
    expect(mockNotificationCleanUpQueue.empty).toBeCalledTimes(1);
    expect(mockNotificationCleanUpQueue.add).toBeCalledTimes(1);
    expect(mockNotificationCleanUpQueue.add).toBeCalledWith(
      {},
      { repeat: { cron: EVERYDAY_MIDNIGHT } },
    );
  });
});

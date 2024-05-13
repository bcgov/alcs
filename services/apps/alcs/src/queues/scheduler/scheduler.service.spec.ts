import { ConfigModule } from '@app/common/config/config.module';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { isDST } from '../../utils/pacific-date-time-helper';
import { BullConfigService } from '../bullConfig.service';
import {
  EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC,
  EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC,
  EVERYDAY_MIDNIGHT_PDT_IN_UTC,
  EVERYDAY_MIDNIGHT_PST_IN_UTC,
  QUEUES,
  SchedulerService,
} from './scheduler.service';

describe('SchedulerService', () => {
  let schedulerService: SchedulerService;
  let mockAppExpiryQueue;
  let mockNotificationCleanUpQueue;
  let mockApplicationStatusEmailsQueue;
  let mockNoticeOfIntentDecisionEmailsQueue;
  let mockApplicationDecisionEmailsQueue;

  beforeEach(async () => {
    mockAppExpiryQueue = {
      add: jest.fn(),
      process: jest.fn(),
      getRepeatableJobs: jest.fn().mockResolvedValue([]),
    };

    mockNotificationCleanUpQueue = {
      add: jest.fn(),
      process: jest.fn(),
      drain: jest.fn(),
      getRepeatableJobs: jest.fn().mockResolvedValue([]),
    };

    mockApplicationStatusEmailsQueue = {
      add: jest.fn(),
      process: jest.fn(),
      getRepeatableJobs: jest.fn().mockResolvedValue([]),
    };

    mockNoticeOfIntentDecisionEmailsQueue = {
      add: jest.fn(),
      process: jest.fn(),
      getRepeatableJobs: jest.fn().mockResolvedValue([]),
    };

    mockApplicationDecisionEmailsQueue = {
      add: jest.fn(),
      process: jest.fn(),
      getRepeatableJobs: jest.fn().mockResolvedValue([]),
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
          provide: getQueueToken(QUEUES.NOTICE_OF_INTENTS_DECISION_EMAILS),
          useValue: mockNoticeOfIntentDecisionEmailsQueue,
        },
        {
          provide: getQueueToken(QUEUES.APPLICATION_DECISION_EMAILS),
          useValue: mockApplicationDecisionEmailsQueue,
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
  //   expect(mockAppExpiryQueue.getRepeatableJobs).toBeCalledTimes(1);
  //   expect(mockAppExpiryQueue.add).toBeCalledTimes(1);
  //   expect(mockAppExpiryQueue.add).toBeCalledWith(
  //     'applicationExpiry',
  //     {},
  //     {
  //       repeat: {
  //         pattern: isDST()
  //           ? MONDAY_TO_FRIDAY_AT_2AM_PDT_IN_UTC
  //           : MONDAY_TO_FRIDAY_AT_2AM_PST_IN_UTC,
  //       },
  //     },
  //   );
  // });

  it('should call add for notification cleanup', async () => {
    await schedulerService.setup();
    expect(mockNotificationCleanUpQueue.getRepeatableJobs).toBeCalledTimes(1);
    expect(mockNotificationCleanUpQueue.add).toBeCalledTimes(1);
    expect(mockNotificationCleanUpQueue.add).toBeCalledWith(
      'cleanupNotifications',
      {},
      {
        repeat: {
          pattern: isDST()
            ? EVERYDAY_MIDNIGHT_PDT_IN_UTC
            : EVERYDAY_MIDNIGHT_PST_IN_UTC,
        },
      },
    );
  });

  it('should call add for application status email', async () => {
    await schedulerService.setup();
    expect(mockApplicationStatusEmailsQueue.getRepeatableJobs).toBeCalledTimes(
      1,
    );
    expect(mockApplicationStatusEmailsQueue.add).toBeCalledTimes(1);
    expect(mockApplicationStatusEmailsQueue.add).toBeCalledWith(
      'applicationSubmissionStatusEmails',
      {},
      {
        repeat: {
          pattern: isDST()
            ? EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC
            : EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC,
        },
      },
    );
  });

  it('should call add for application emails', async () => {
    await schedulerService.setup();
    expect(
      mockApplicationDecisionEmailsQueue.getRepeatableJobs,
    ).toBeCalledTimes(1);
    expect(mockApplicationDecisionEmailsQueue.add).toBeCalledTimes(1);
    expect(mockApplicationDecisionEmailsQueue.add).toBeCalledWith(
      'applicationDecisionEmails',
      {},
      {
        repeat: {
          pattern: isDST()
            ? EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC
            : EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC,
        },
      },
    );
  });

  it('should call add for notice of intent decision emails', async () => {
    await schedulerService.setup();
    expect(
      mockNoticeOfIntentDecisionEmailsQueue.getRepeatableJobs,
    ).toBeCalledTimes(1);
    expect(mockNoticeOfIntentDecisionEmailsQueue.add).toBeCalledTimes(1);
    expect(mockNoticeOfIntentDecisionEmailsQueue.add).toBeCalledWith(
      'noticeOfIntentDecisionEmails',
      {},
      {
        repeat: {
          pattern: isDST()
            ? EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC
            : EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC,
        },
      },
    );
  });
});

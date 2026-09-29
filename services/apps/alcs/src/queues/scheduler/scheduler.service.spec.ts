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
      upsertJobScheduler: jest.fn(),
      process: jest.fn(),
      getJobSchedulers: jest.fn().mockResolvedValue([]),
    };

    mockNotificationCleanUpQueue = {
      upsertJobScheduler: jest.fn(),
      process: jest.fn(),
      drain: jest.fn(),
      getJobSchedulers: jest.fn().mockResolvedValue([]),
    };

    mockApplicationStatusEmailsQueue = {
      upsertJobScheduler: jest.fn(),
      process: jest.fn(),
      getJobSchedulers: jest.fn().mockResolvedValue([]),
    };

    mockNoticeOfIntentDecisionEmailsQueue = {
      upsertJobScheduler: jest.fn(),
      process: jest.fn(),
      getJobSchedulers: jest.fn().mockResolvedValue([]),
    };

    mockApplicationDecisionEmailsQueue = {
      upsertJobScheduler: jest.fn(),
      process: jest.fn(),
      getJobSchedulers: jest.fn().mockResolvedValue([]),
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
  //   expect(mockAppExpiryQueue.getJobSchedulers).toHaveBeenCalledTimes(1);
  //   expect(mockAppExpiryQueue.upsertJobScheduler).toHaveBeenCalledTimes(1);
  //   expect(mockAppExpiryQueue.upsertJobScheduler).toHaveBeenCalledWith(
  //     'applicationExpiry',
  //     {
  //         pattern: isDST()
  //           ? MONDAY_TO_FRIDAY_AT_2AM_PDT_IN_UTC
  //           : MONDAY_TO_FRIDAY_AT_2AM_PST_IN_UTC,
  //     },
  //   );
  // });

  it('should call add for notification cleanup', async () => {
    await schedulerService.setup();
    expect(mockNotificationCleanUpQueue.getJobSchedulers).toHaveBeenCalledTimes(1);
    expect(mockNotificationCleanUpQueue.upsertJobScheduler).toHaveBeenCalledTimes(1);
    expect(mockNotificationCleanUpQueue.upsertJobScheduler).toHaveBeenCalledWith('cleanupNotifications', {
      pattern: isDST() ? EVERYDAY_MIDNIGHT_PDT_IN_UTC : EVERYDAY_MIDNIGHT_PST_IN_UTC,
    });
  });

  it('should call add for application status email', async () => {
    await schedulerService.setup();
    expect(mockApplicationStatusEmailsQueue.getJobSchedulers).toHaveBeenCalledTimes(1);
    expect(mockApplicationStatusEmailsQueue.upsertJobScheduler).toHaveBeenCalledTimes(1);
    expect(mockApplicationStatusEmailsQueue.upsertJobScheduler).toHaveBeenCalledWith(
      'applicationSubmissionStatusEmails',
      {
        pattern: isDST()
          ? EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC
          : EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC,
      },
    );
  });

  it('should call add for application emails', async () => {
    await schedulerService.setup();
    expect(mockApplicationDecisionEmailsQueue.getJobSchedulers).toHaveBeenCalledTimes(1);
    expect(mockApplicationDecisionEmailsQueue.upsertJobScheduler).toHaveBeenCalledTimes(1);
    expect(mockApplicationDecisionEmailsQueue.upsertJobScheduler).toHaveBeenCalledWith('applicationDecisionEmails', {
      pattern: isDST() ? EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC : EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC,
    });
  });

  it('should call add for notice of intent decision emails', async () => {
    await schedulerService.setup();
    expect(mockNoticeOfIntentDecisionEmailsQueue.getJobSchedulers).toHaveBeenCalledTimes(1);
    expect(mockNoticeOfIntentDecisionEmailsQueue.upsertJobScheduler).toHaveBeenCalledTimes(1);
    expect(mockNoticeOfIntentDecisionEmailsQueue.upsertJobScheduler).toHaveBeenCalledWith(
      'noticeOfIntentDecisionEmails',
      {
        pattern: isDST()
          ? EVERY_15_MINUTES_STARTING_FROM_8AM_PDT_IN_UTC
          : EVERY_15_MINUTES_STARTING_FROM_8AM_PST_IN_UTC,
      },
    );
  });
});

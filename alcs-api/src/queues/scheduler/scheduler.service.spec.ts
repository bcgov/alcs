import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../../common/config/config.module';
import { BullConfigService } from '../bullConfig.service';
import { SchedulerService } from './scheduler.service';

describe('SchedulerService', () => {
  let schedulerService: SchedulerService;
  let mockQueue;

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn(),
      process: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        BullModule.forRootAsync({
          useClass: BullConfigService,
        }),
        BullModule.registerQueue({
          name: 'SchedulerQueue',
        }),
      ],
      providers: [SchedulerService, BullConfigService],
    })
      .overrideProvider(getQueueToken('SchedulerQueue'))
      .useValue(mockQueue)
      .compile();

    schedulerService = module.get<SchedulerService>(SchedulerService);
  });

  it('should be defined', () => {
    expect(schedulerService).toBeDefined();
  });

  it('should call add once on scheduleApplicationExpiry', () => {
    schedulerService.scheduleApplicationExpiry();
    expect(mockQueue.add).toBeCalledTimes(1);
    // expect(mockQueue.add).nthCalledWith(1, {
    //   repeat: { cron: '0 0 2 * * 1-5' },
    // });
    expect(mockQueue.add).toBeCalledWith(
      {},
      { repeat: { cron: '0 0 2 * * 1-5' } },
    );
  });
});

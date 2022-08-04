import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerConsumerService } from './scheduler.consumer.service';

describe('SchedulerConsumerService', () => {
  let service: SchedulerConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulerConsumerService],
    }).compile();

    service = module.get<SchedulerConsumerService>(SchedulerConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentService } from './notice-of-intent.service';

describe('NoticeOfIntentService', () => {
  let service: NoticeOfIntentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeOfIntentService],
    }).compile();

    service = module.get<NoticeOfIntentService>(NoticeOfIntentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

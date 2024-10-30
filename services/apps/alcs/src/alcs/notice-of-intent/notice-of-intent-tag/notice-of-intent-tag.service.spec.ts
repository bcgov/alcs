import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentTagService } from './notice-of-intent-tag.service';

describe('NoticeOfIntentTagService', () => {
  let service: NoticeOfIntentTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeOfIntentTagService],
    }).compile();

    service = module.get<NoticeOfIntentTagService>(NoticeOfIntentTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentMeetingService } from './notice-of-intent-meeting.service';

describe('NoticeOfIntentMeetingService', () => {
  let service: NoticeOfIntentMeetingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoticeOfIntentMeetingService],
    }).compile();

    service = module.get<NoticeOfIntentMeetingService>(NoticeOfIntentMeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

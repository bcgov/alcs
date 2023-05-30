import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentMeetingController } from './notice-of-intent-meeting.controller';

describe('NoticeOfIntentMeetingController', () => {
  let controller: NoticeOfIntentMeetingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeOfIntentMeetingController],
    }).compile();

    controller = module.get<NoticeOfIntentMeetingController>(NoticeOfIntentMeetingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentTagController } from './notice-of-intent-tag.controller';

describe('NoticeOfIntentTagController', () => {
  let controller: NoticeOfIntentTagController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeOfIntentTagController],
    }).compile();

    controller = module.get<NoticeOfIntentTagController>(NoticeOfIntentTagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

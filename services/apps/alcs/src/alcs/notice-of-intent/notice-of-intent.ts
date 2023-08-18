import { Test, TestingModule } from '@nestjs/testing';
import { NoticeOfIntentController } from './notice-of-intent.controller';

describe('NoiController', () => {
  let controller: NoticeOfIntentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeOfIntentController],
    }).compile();

    controller = module.get<NoticeOfIntentController>(NoticeOfIntentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

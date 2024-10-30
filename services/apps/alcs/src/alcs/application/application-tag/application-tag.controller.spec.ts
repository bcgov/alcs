import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationTagController } from './application-tag.controller';

describe('ApplicationTagController', () => {
  let controller: ApplicationTagController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationTagController],
    }).compile();

    controller = module.get<ApplicationTagController>(ApplicationTagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

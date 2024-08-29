import { Test, TestingModule } from '@nestjs/testing';
import { IncomingFileController } from './incoming-file.controller';

describe('IncomingFileController', () => {
  let controller: IncomingFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomingFileController],
    }).compile();

    controller = module.get<IncomingFileController>(IncomingFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

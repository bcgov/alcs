import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationEditController } from './application-edit.controller';

describe('ApplicationEditController', () => {
  let controller: ApplicationEditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationEditController],
    }).compile();

    controller = module.get<ApplicationEditController>(
      ApplicationEditController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

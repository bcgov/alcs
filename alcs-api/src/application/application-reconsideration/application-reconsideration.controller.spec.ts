import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationReconsiderationController } from './application-reconsideration.controller';

describe('ApplicationReconsiderationController', () => {
  let controller: ApplicationReconsiderationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationReconsiderationController],
    }).compile();

    controller = module.get<ApplicationReconsiderationController>(ApplicationReconsiderationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

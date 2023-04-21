import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationDecisionController } from './application-decision.controller';

describe('ApplicationDecisionController', () => {
  let controller: ApplicationDecisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationDecisionController],
    }).compile();

    controller = module.get<ApplicationDecisionController>(ApplicationDecisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

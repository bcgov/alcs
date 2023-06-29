import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationDecisionConditionController } from './application-decision-condition.controller';

describe('ApplicationDecisionConditionController', () => {
  let controller: ApplicationDecisionConditionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationDecisionConditionController],
    }).compile();

    controller = module.get<ApplicationDecisionConditionController>(
      ApplicationDecisionConditionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

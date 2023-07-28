import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationDecisionComponentLotController } from './application-decision-component-lot.controller';

describe('ApplicationDecisionComponentLotController', () => {
  let controller: ApplicationDecisionComponentLotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationDecisionComponentLotController],
    }).compile();

    controller = module.get<ApplicationDecisionComponentLotController>(
      ApplicationDecisionComponentLotController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

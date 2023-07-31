import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationConditionToComponentLotController } from './application-condition-to-component-lot.controller';

describe('ApplicationConditionToComponentLotController', () => {
  let controller: ApplicationConditionToComponentLotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationConditionToComponentLotController],
    }).compile();

    controller = module.get<ApplicationConditionToComponentLotController>(ApplicationConditionToComponentLotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

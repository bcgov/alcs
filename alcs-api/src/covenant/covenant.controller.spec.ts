import { Test, TestingModule } from '@nestjs/testing';
import { CovenantController } from './covenant.controller';

describe('CovenantController', () => {
  let controller: CovenantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CovenantController],
    }).compile();

    controller = module.get<CovenantController>(CovenantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

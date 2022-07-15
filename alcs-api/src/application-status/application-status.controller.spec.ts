import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationStatusController } from './application-status.controller';

describe('ApplicationStatusController', () => {
  let controller: ApplicationStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationStatusController],
    }).compile();

    controller = module.get<ApplicationStatusController>(
      ApplicationStatusController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

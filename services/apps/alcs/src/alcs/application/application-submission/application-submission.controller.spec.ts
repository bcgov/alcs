import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationSubmissionController } from './application-submission.controller';

describe('ApplicationSubmissionController', () => {
  let controller: ApplicationSubmissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationSubmissionController],
    }).compile();

    controller = module.get<ApplicationSubmissionController>(ApplicationSubmissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

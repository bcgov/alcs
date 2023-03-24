import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationSubmissionReviewController } from './application-submission-review.controller';

describe('ApplicationSubmissionReviewController', () => {
  let controller: ApplicationSubmissionReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationSubmissionReviewController],
    }).compile();

    controller = module.get<ApplicationSubmissionReviewController>(ApplicationSubmissionReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

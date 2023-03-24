import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

describe('ApplicationSubmissionReviewService', () => {
  let service: ApplicationSubmissionReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationSubmissionReviewService],
    }).compile();

    service = module.get<ApplicationSubmissionReviewService>(ApplicationSubmissionReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

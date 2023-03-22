import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationSubmissionService],
    }).compile();

    service = module.get<ApplicationSubmissionService>(ApplicationSubmissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

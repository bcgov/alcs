import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationSubmissionStatusService } from './application-submission-status.service';

describe('ApplicationSubmissionStatusService', () => {
  let service: ApplicationSubmissionStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationSubmissionStatusService],
    }).compile();

    service = module.get<ApplicationSubmissionStatusService>(
      ApplicationSubmissionStatusService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

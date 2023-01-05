import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionTypeService } from './submission-type.service';

describe('Service', () => {
  let service: SubmissionTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubmissionTypeService],
    }).compile();

    service = module.get<SubmissionTypeService>(SubmissionTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

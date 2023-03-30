import { Test, TestingModule } from '@nestjs/testing';
import { GenerateSubmissionDocumentService } from './generate-submission-document.service';

describe('GenerateSubmissionDocumentService', () => {
  let service: GenerateSubmissionDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerateSubmissionDocumentService],
    }).compile();

    service = module.get<GenerateSubmissionDocumentService>(GenerateSubmissionDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

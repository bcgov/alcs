import { Test, TestingModule } from '@nestjs/testing';
import { InquiryDocumentService } from './inquiry-document.service';

describe('InquiryDocumentService', () => {
  let service: InquiryDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquiryDocumentService],
    }).compile();

    service = module.get<InquiryDocumentService>(InquiryDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { InquirySearchService } from './inquiry.service';

describe('InquiryService', () => {
  let service: InquirySearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquirySearchService],
    }).compile();

    service = module.get<InquirySearchService>(InquirySearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

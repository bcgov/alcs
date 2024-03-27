import { Test, TestingModule } from '@nestjs/testing';
import { InquiryAdvancedSearchService } from './inquiry-advanced-search.service';

describe('InquiryAdvancedSearchService', () => {
  let service: InquiryAdvancedSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquiryAdvancedSearchService],
    }).compile();

    service = module.get<InquiryAdvancedSearchService>(
      InquiryAdvancedSearchService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

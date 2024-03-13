import { Test, TestingModule } from '@nestjs/testing';
import { InquiryService } from './inquiry.service';

describe('InquiryService', () => {
  let service: InquiryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquiryService],
    }).compile();

    service = module.get<InquiryService>(InquiryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

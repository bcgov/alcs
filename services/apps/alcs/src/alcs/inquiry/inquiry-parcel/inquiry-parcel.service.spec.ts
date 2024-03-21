import { Test, TestingModule } from '@nestjs/testing';
import { InquiryParcelService } from './inquiry-parcel.service';

describe('InquiryParcelService', () => {
  let service: InquiryParcelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquiryParcelService],
    }).compile();

    service = module.get<InquiryParcelService>(InquiryParcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

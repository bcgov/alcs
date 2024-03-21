import { Test, TestingModule } from '@nestjs/testing';
import { InquiryParcelController } from './inquiry-parcel.controller';

describe('InquiryParcelController', () => {
  let controller: InquiryParcelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InquiryParcelController],
    }).compile();

    controller = module.get<InquiryParcelController>(InquiryParcelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

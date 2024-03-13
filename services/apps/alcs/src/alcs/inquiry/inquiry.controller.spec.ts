import { Test, TestingModule } from '@nestjs/testing';
import { InquiryController } from './inquiry.controller';

describe('InquiryController', () => {
  let controller: InquiryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InquiryController],
    }).compile();

    controller = module.get<InquiryController>(InquiryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

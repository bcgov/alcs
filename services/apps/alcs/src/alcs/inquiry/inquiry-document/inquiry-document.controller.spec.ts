import { Test, TestingModule } from '@nestjs/testing';
import { InquiryDocumentController } from './inquiry-document.controller';

describe('InquiryDocumentController', () => {
  let controller: InquiryDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InquiryDocumentController],
    }).compile();

    controller = module.get<InquiryDocumentController>(InquiryDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

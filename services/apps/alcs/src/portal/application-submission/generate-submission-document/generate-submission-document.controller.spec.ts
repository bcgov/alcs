import { Test, TestingModule } from '@nestjs/testing';
import { GenerateSubmissionDocumentController } from './generate-submission-document.controller';

describe('GenerateSubmissionDocumentController', () => {
  let controller: GenerateSubmissionDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenerateSubmissionDocumentController],
    }).compile();

    controller = module.get<GenerateSubmissionDocumentController>(GenerateSubmissionDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

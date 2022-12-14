import { Test, TestingModule } from '@nestjs/testing';
import { AlcsDocumentService } from './alcs-document.service';

describe('AlcsDocumentService', () => {
  let service: AlcsDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlcsDocumentService],
    }).compile();

    service = module.get<AlcsDocumentService>(AlcsDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.createExternalDocument).toBeDefined();
  });
});

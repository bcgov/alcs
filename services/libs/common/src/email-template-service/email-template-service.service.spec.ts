import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplateServiceService } from './email-template-service.service';

describe('EmailTemplateServiceService', () => {
  let service: EmailTemplateServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailTemplateServiceService],
    }).compile();

    service = module.get<EmailTemplateServiceService>(EmailTemplateServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

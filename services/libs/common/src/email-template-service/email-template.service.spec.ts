import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplateService } from './email-template.service';

describe('EmailTemplateServiceService', () => {
  let service: EmailTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailTemplateService],
    }).compile();

    service = module.get<EmailTemplateService>(EmailTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

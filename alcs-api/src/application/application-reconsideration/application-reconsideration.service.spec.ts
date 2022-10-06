import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationReconsiderationService } from './application-reconsideration.service';

describe('ReconsiderationService', () => {
  let service: ApplicationReconsiderationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationReconsiderationService],
    }).compile();

    service = module.get<ApplicationReconsiderationService>(
      ApplicationReconsiderationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

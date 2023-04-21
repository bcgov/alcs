import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationDecisionService } from './application-decision.service';

describe('ApplicationDecisionService', () => {
  let service: ApplicationDecisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationDecisionService],
    }).compile();

    service = module.get<ApplicationDecisionService>(ApplicationDecisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

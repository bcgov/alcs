import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationDecisionComponentLotService } from './application-decision-component-lot.service';

describe('ApplicationDecisionComponentLotService', () => {
  let service: ApplicationDecisionComponentLotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationDecisionComponentLotService],
    }).compile();

    service = module.get<ApplicationDecisionComponentLotService>(
      ApplicationDecisionComponentLotService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

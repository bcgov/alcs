import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationConditionToComponentLotService } from './application-condition-to-component-lot.service';

describe('ApplicationConditionToComponentLotService', () => {
  let service: ApplicationConditionToComponentLotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationConditionToComponentLotService],
    }).compile();

    service = module.get<ApplicationConditionToComponentLotService>(ApplicationConditionToComponentLotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

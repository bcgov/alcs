import { Test, TestingModule } from '@nestjs/testing';
import { CovenantAdvancedSearchService } from './covenant-advanced-search.service';

describe('CovenantAdvancedSearchService', () => {
  let service: CovenantAdvancedSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CovenantAdvancedSearchService],
    }).compile();

    service = module.get<CovenantAdvancedSearchService>(
      CovenantAdvancedSearchService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

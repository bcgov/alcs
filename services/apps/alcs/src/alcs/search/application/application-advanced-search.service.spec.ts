import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationAdvancedSearchService } from './application-advanced-search.service';

describe('ApplicationAdvancedSearchService', () => {
  let service: ApplicationAdvancedSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationAdvancedSearchService],
    }).compile();

    service = module.get<ApplicationAdvancedSearchService>(
      ApplicationAdvancedSearchService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

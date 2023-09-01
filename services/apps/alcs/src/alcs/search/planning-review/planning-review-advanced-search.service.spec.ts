import { Test, TestingModule } from '@nestjs/testing';
import { PlanningReviewAdvancedService } from './planning-review-advanced-search.service';

describe('PlanningReviewAdvancedSearchService', () => {
  let service: PlanningReviewAdvancedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanningReviewAdvancedService],
    }).compile();

    service = module.get<PlanningReviewAdvancedService>(
      PlanningReviewAdvancedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanningReview } from '../../planning-review/planning-review.entity';
import { PlanningReviewSearchRequestDto } from '../search.dto';
import { PlanningReviewAdvancedService } from './planning-review-advanced-search.service';

describe('PlanningReviewAdvancedSearchService', () => {
  let service: PlanningReviewAdvancedService;
  let mockPlanningReviewRepository: DeepMocked<Repository<PlanningReview>>;

  beforeEach(async () => {
    mockPlanningReviewRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningReviewAdvancedService,
        {
          provide: getRepositoryToken(PlanningReview),
          useValue: mockPlanningReviewRepository,
        },
      ],
    }).compile();

    service = module.get<PlanningReviewAdvancedService>(
      PlanningReviewAdvancedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully search for Planning Reviews defined', async () => {
    const mockPlanningReview = new PlanningReview();
    mockPlanningReviewRepository.findAndCount.mockResolvedValue([
      [mockPlanningReview],
      0,
    ]);

    const searchDto: PlanningReviewSearchRequestDto = {
      fileNumber: '123',
      governmentName: 'B',
      regionCode: 'C',
      page: 1,
      pageSize: 10,
      sortField: 'fileId',
      sortDirection: 'ASC',
    };

    const result = await service.searchPlanningReviews(searchDto);

    expect(mockPlanningReviewRepository.findAndCount).toBeCalledTimes(1);
    expect(mockPlanningReviewRepository.findAndCount).toBeCalledWith({
      where: {
        fileNumber: searchDto.fileNumber,
        localGovernment: {
          name: searchDto.governmentName,
        },
        regionCode: searchDto.regionCode,
      },
      relations: {
        localGovernment: true,
      },
      skip: (searchDto.page - 1) * searchDto.pageSize,
      take: searchDto.pageSize,
      order: { fileNumber: 'ASC' },
    });
    expect(result).toEqual({ data: [mockPlanningReview], total: 0 });
    expect(result.total).toEqual(0);
  });
});

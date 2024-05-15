import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { createMockQuery } from '../../../../test/mocks/mockTypes';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { PlanningReview } from '../../planning-review/planning-review.entity';
import { SearchRequestDto } from '../search.dto';
import { PlanningReviewAdvancedSearchService } from './planning-review-advanced-search.service';
import { PlanningReviewSearchView } from './planning-review-search-view.entity';

describe('PlanningReviewAdvancedSearchService', () => {
  let service: PlanningReviewAdvancedSearchService;
  let mockPRSearchView: DeepMocked<Repository<PlanningReviewSearchView>>;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  let mockPlanningReviewRepository: DeepMocked<Repository<PlanningReview>>;
  let mockRedisService: DeepMocked<RedisService>;
  let mockQueryRunner: DeepMocked<QueryRunner>;

  const sortFields = [
    'fileId',
    'type',
    'government',
    'dateSubmitted',
    'status',
  ];

  const mockSearchDto: SearchRequestDto = {
    fileNumber: '123',
    portalStatusCodes: ['A'],
    governmentName: 'B',
    regionCode: 'C',
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    dateSubmittedFrom: new Date('2020-10-10').getTime(),
    dateSubmittedTo: new Date('2021-10-10').getTime(),
    dateDecidedFrom: new Date('2020-11-10').getTime(),
    dateDecidedTo: new Date('2021-11-10').getTime(),
    resolutionNumber: 123,
    resolutionYear: 2021,
    fileTypes: ['type1', 'type2'],
    page: 1,
    pageSize: 10,
    sortField: 'ownerName',
    sortDirection: 'ASC',
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockPRSearchView = createMock();
    mockLocalGovernmentRepository = createMock();
    mockPlanningReviewRepository = createMock();
    mockRedisService = createMock();
    mockQueryRunner = createMock();

    mockQuery = createMockQuery();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningReviewAdvancedSearchService,
        {
          provide: getRepositoryToken(PlanningReviewSearchView),
          useValue: mockPRSearchView,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
        {
          provide: getRepositoryToken(PlanningReview),
          useValue: mockPlanningReviewRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<PlanningReviewAdvancedSearchService>(
      PlanningReviewAdvancedSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
    );

    mockPRSearchView.createQueryBuilder.mockReturnValue(mockQuery);

    mockRedisService.getClient.mockReturnValue({
      get: async () => null,
      setEx: async () => null,
    } as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockPlanningReviewRepository.find.mockResolvedValue([]);
    mockPlanningReviewRepository.createQueryBuilder.mockReturnValue(mockQuery);

    const result = await service.search(mockSearchDto, mockQueryRunner);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockPlanningReviewRepository.find).toHaveBeenCalledTimes(3);
    expect(
      mockPlanningReviewRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(5);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(6);
  });

  it('should call searchForFileNumbers method correctly', async () => {
    const searchForFileNumbersSpy = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue(new Set(['100000']));

    const result = await service.search(mockSearchDto, mockQueryRunner);

    expect(result).toEqual({ data: [], total: 0 });
    expect(searchForFileNumbersSpy).toHaveBeenCalledWith(mockSearchDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });

  sortFields.forEach((sortField) => {
    it(`should sort by ${sortField}`, async () => {
      const searchForFileNumbersSpy = jest
        .spyOn(service as any, 'searchForFileNumbers')
        .mockResolvedValue(new Set(['100000']));

      mockSearchDto.sortField = sortField;
      mockSearchDto.sortDirection = 'DESC';

      const result = await service.search(mockSearchDto, mockQueryRunner);

      expect(result).toEqual({ data: [], total: 0 });
      expect(searchForFileNumbersSpy).toHaveBeenCalledWith(mockSearchDto);
      expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
      expect(mockQuery.offset).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    });
  });
});

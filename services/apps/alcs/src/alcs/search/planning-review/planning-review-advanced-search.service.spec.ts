import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { SearchRequestDto } from '../search.dto';
import { PlanningReviewAdvancedSearchService } from './planning-review-advanced-search.service';
import { PlanningReviewSearchView } from './planning-review-search-view.entity';

describe('PlanningReviewAdvancedSearchService', () => {
  let service: PlanningReviewAdvancedSearchService;
  let mockPRSearchView: DeepMocked<Repository<PlanningReviewSearchView>>;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  const sortFields = ['fileId', 'type', 'government', 'dateSubmitted'];

  const mockSearchDto: SearchRequestDto = {
    fileNumber: '123',
    portalStatusCode: 'A',
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

    mockQuery = {
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      orderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      innerJoinAndMapOne: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
    };

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
      ],
    }).compile();

    service = module.get<PlanningReviewAdvancedSearchService>(
      PlanningReviewAdvancedSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockPRSearchView.createQueryBuilder.mockReturnValue(mockQuery as any);

    const result = await service.search(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockPRSearchView.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(11);
  });

  it('should call compileSearchQuery method correctly', async () => {
    const compileSearchQuerySpy = jest
      .spyOn(service as any, 'compileSearchQuery')
      .mockResolvedValue(mockQuery);

    const result = await service.search(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileSearchQuerySpy).toHaveBeenCalledWith(mockSearchDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });

  sortFields.forEach((sortField) => {
    it(`should sort by ${sortField}`, async () => {
      const compileSearchQuerySpy = jest
        .spyOn(service as any, 'compileSearchQuery')
        .mockResolvedValue(mockQuery);

      mockSearchDto.sortField = sortField;
      mockSearchDto.sortDirection = 'DESC';

      const result = await service.search(mockSearchDto);

      expect(result).toEqual({ data: [], total: 0 });
      expect(compileSearchQuerySpy).toHaveBeenCalledWith(mockSearchDto);
      expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
      expect(mockQuery.offset).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    });
  });
});

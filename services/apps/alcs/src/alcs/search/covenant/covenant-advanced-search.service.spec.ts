import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Covenant } from '../../covenant/covenant.entity';
import { CovenantSearchRequestDto } from '../search.dto';
import { CovenantAdvancedSearchService } from './covenant-advanced-search.service';

describe('CovenantAdvancedSearchService', () => {
  let service: CovenantAdvancedSearchService;
  let mockCovenantRepository: DeepMocked<Repository<Covenant>>;

  let mockQuery: any = {};

  const mockSearchRequestDto: CovenantSearchRequestDto = {
    fileNumber: '123',
    governmentName: 'B',
    regionCode: 'C',
    name: 'D',
    page: 1,
    pageSize: 10,
    sortField: 'applicant',
    sortDirection: 'ASC',
  };

  beforeEach(async () => {
    mockCovenantRepository = createMock();

    mockQuery = {
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      orderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      leftJoinAndMapOne: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CovenantAdvancedSearchService,
        {
          provide: getRepositoryToken(Covenant),
          useValue: mockCovenantRepository,
        },
      ],
    }).compile();

    service = module.get<CovenantAdvancedSearchService>(
      CovenantAdvancedSearchService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockCovenantRepository.createQueryBuilder.mockReturnValue(mockQuery as any);

    const result = await service.searchCovenants(mockSearchRequestDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockCovenantRepository.createQueryBuilder).toBeCalledTimes(1);
    expect(mockQuery.andWhere).toBeCalledTimes(4);
    expect(mockQuery.where).toBeCalledTimes(1);
  });

  it('should call compileSearchQuery method correctly', async () => {
    const compileCovenantSearchQuerySpy = jest
      .spyOn(service as any, 'compileSearchQuery')
      .mockResolvedValue(mockQuery);

    const result = await service.searchCovenants(mockSearchRequestDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileCovenantSearchQuerySpy).toBeCalledWith(mockSearchRequestDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NonApplicationsSearchRequestDto } from '../search.dto';
import { NonApplicationSearchView } from './non-applications-view.entity';
import { NonApplicationsAdvancedSearchService } from './non-applications.service';

describe('NonApplicationsService', () => {
  let service: NonApplicationsAdvancedSearchService;
  let mockNonApplicationsRepository: DeepMocked<
    Repository<NonApplicationSearchView>
  >;

  let mockQuery: any = {};

  const mockSearchRequestDto: NonApplicationsSearchRequestDto = {
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
    mockNonApplicationsRepository = createMock();

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
        NonApplicationsAdvancedSearchService,
        {
          provide: getRepositoryToken(NonApplicationSearchView),
          useValue: mockNonApplicationsRepository,
        },
      ],
    }).compile();

    service = module.get<NonApplicationsAdvancedSearchService>(
      NonApplicationsAdvancedSearchService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockNonApplicationsRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.searchNonApplications(mockSearchRequestDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockNonApplicationsRepository.createQueryBuilder).toBeCalledTimes(1);
    expect(mockQuery.andWhere).toBeCalledTimes(4);
    expect(mockQuery.where).toBeCalledTimes(1);
  });

  it('should call compileSearchQuery method correctly', async () => {
    const compileNonApplicationSearchQuerySpy = jest
      .spyOn(service as any, 'compileSearchQuery')
      .mockResolvedValue(mockQuery);

    const result = await service.searchNonApplications(mockSearchRequestDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileNonApplicationSearchQuerySpy).toBeCalledWith(
      mockSearchRequestDto,
    );
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

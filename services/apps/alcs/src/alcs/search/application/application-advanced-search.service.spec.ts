import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { SearchRequestDto } from '../search.dto';
import { ApplicationAdvancedSearchService } from './application-advanced-search.service';
import { ApplicationSubmissionSearchView } from './application-search-view.entity';

describe('ApplicationAdvancedSearchService', () => {
  let service: ApplicationAdvancedSearchService;
  let mockApplicationSubmissionSearchViewRepository: DeepMocked<
    Repository<ApplicationSubmissionSearchView>
  >;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  const sortFields = [
    'fileId',
    'type',
    'government',
    'portalStatus',
    'dateSubmitted',
  ];

  const mockSearchRequestDto: SearchRequestDto = {
    fileNumber: '123',
    legacyId: '123',
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
    mockApplicationSubmissionSearchViewRepository = createMock();
    mockLocalGovernmentRepository = createMock();

    mockQuery = {
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
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
        ApplicationAdvancedSearchService,
        {
          provide: getRepositoryToken(ApplicationSubmissionSearchView),
          useValue: mockApplicationSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationAdvancedSearchService>(
      ApplicationAdvancedSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockApplicationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const mockQueryRunner = createMock<QueryRunner>();

    const result = await service.searchApplications(
      mockSearchRequestDto,
      mockQueryRunner,
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(
      mockApplicationSubmissionSearchViewRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(1);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(15);
    expect(mockQuery.where).toHaveBeenCalledTimes(1);
  });

  it('should call compileApplicationSearchQuery method correctly', async () => {
    const compileApplicationSearchQuerySpy = jest
      .spyOn(service as any, 'compileApplicationSearchQuery')
      .mockResolvedValue(mockQuery);

    const mockQueryRunner = createMock<QueryRunner>();

    const result = await service.searchApplications(
      mockSearchRequestDto,
      mockQueryRunner,
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileApplicationSearchQuerySpy).toHaveBeenCalledWith(
      mockSearchRequestDto,
      {},
    );
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });

  sortFields.forEach((sortField) => {
    it(`should sort by ${sortField}`, async () => {
      const mockQueryRunner = createMock<QueryRunner>();

      const compileApplicationSearchQuerySpy = jest
        .spyOn(service as any, 'compileApplicationSearchQuery')
        .mockResolvedValue(mockQuery);

      mockSearchRequestDto.sortField = sortField;
      mockSearchRequestDto.sortDirection = 'DESC';

      const result = await service.searchApplications(
        mockSearchRequestDto,
        mockQueryRunner,
      );

      expect(result).toEqual({ data: [], total: 0 });
      expect(compileApplicationSearchQuerySpy).toHaveBeenCalledWith(
        mockSearchRequestDto,
        {},
      );
      expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
      expect(mockQuery.offset).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    });
  });
});

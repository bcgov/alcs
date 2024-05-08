import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { createMockQuery } from '../../../../test/mocks/mockTypes';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { Application } from '../../application/application.entity';
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
  let mockAppRepo: DeepMocked<Repository<Application>>;
  let mockAppSubmissionRepo: DeepMocked<Repository<ApplicationSubmission>>;
  let mockRedisService: DeepMocked<RedisService>;

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
    mockAppRepo = createMock();
    mockAppSubmissionRepo = createMock();
    mockRedisService = createMock();
    mockQuery = createMockQuery();

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
        {
          provide: getRepositoryToken(Application),
          useValue: mockAppRepo,
        },
        {
          provide: getRepositoryToken(ApplicationSubmission),
          useValue: mockAppSubmissionRepo,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ApplicationAdvancedSearchService>(
      ApplicationAdvancedSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
    );

    mockApplicationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    mockRedisService.getClient.mockReturnValue({
      get: async () => null,
      setEx: async () => null,
    } as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockAppRepo.find.mockResolvedValue([]);
    mockAppRepo.createQueryBuilder.mockReturnValue(mockQuery);
    mockAppSubmissionRepo.find.mockResolvedValue([]);
    mockAppSubmissionRepo.createQueryBuilder.mockReturnValue(mockQuery);

    const mockQueryRunner = createMock<QueryRunner>();

    const result = await service.searchApplications(
      mockSearchRequestDto,
      mockQueryRunner,
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockAppRepo.find).toHaveBeenCalledTimes(4);
    expect(mockAppRepo.createQueryBuilder).toHaveBeenCalledTimes(4);
    expect(mockAppSubmissionRepo.createQueryBuilder).toHaveBeenCalledTimes(3);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(9);
    expect(mockQuery.where).toHaveBeenCalledTimes(2);
  });

  it('should call compileApplicationSearchQuery method correctly', async () => {
    const searchForFileNumbersSpy = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue(new Set(['100000']));

    const mockQueryRunner = createMock<QueryRunner>();

    const result = await service.searchApplications(
      mockSearchRequestDto,
      mockQueryRunner,
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(searchForFileNumbersSpy).toHaveBeenCalledWith(mockSearchRequestDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });

  sortFields.forEach((sortField) => {
    it(`should sort by ${sortField}`, async () => {
      const mockQueryRunner = createMock<QueryRunner>();

      const searchForFileNumbersSpy = jest
        .spyOn(service as any, 'searchForFileNumbers')
        .mockResolvedValue(new Set(['100000']));

      mockSearchRequestDto.sortField = sortField;
      mockSearchRequestDto.sortDirection = 'DESC';

      const result = await service.searchApplications(
        mockSearchRequestDto,
        mockQueryRunner,
      );

      expect(result).toEqual({ data: [], total: 0 });
      expect(searchForFileNumbersSpy).toHaveBeenCalledWith(
        mockSearchRequestDto,
      );
      expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
      expect(mockQuery.offset).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    });
  });
});

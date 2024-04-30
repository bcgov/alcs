import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockQuery } from '../../../../../test/mocks/mockTypes';
import { Application } from '../../../../alcs/application/application.entity';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { ApplicationSubmission } from '../../../application-submission/application-submission.entity';
import { SearchRequestDto } from '../public-search.dto';
import { PublicApplicationSubmissionSearchView } from './public-application-search-view.entity';
import { PublicApplicationSearchService } from './public-application-search.service';

describe('PublicApplicationSearchService', () => {
  let service: PublicApplicationSearchService;
  let mockApplicationSubmissionSearchViewRepository: DeepMocked<
    Repository<PublicApplicationSubmissionSearchView>
  >;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  let mockApplicationRepository: DeepMocked<Repository<Application>>;
  let mockApplicationSubmissionRepository: DeepMocked<
    Repository<ApplicationSubmission>
  >;
  let mockRedisService: DeepMocked<RedisService>;

  const mockSearchRequestDto: SearchRequestDto = {
    fileNumber: '123',
    portalStatusCodes: ['A'],
    governmentName: 'B',
    regionCodes: ['C'],
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    dateDecidedFrom: new Date('2020-11-10').getTime(),
    dateDecidedTo: new Date('2021-11-10').getTime(),
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
    mockApplicationRepository = createMock();
    mockApplicationSubmissionRepository = createMock();
    mockRedisService = createMock();

    mockQuery = createMockQuery();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicApplicationSearchService,
        {
          provide: getRepositoryToken(PublicApplicationSubmissionSearchView),
          useValue: mockApplicationSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationSubmission),
          useValue: mockApplicationSubmissionRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<PublicApplicationSearchService>(
      PublicApplicationSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
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
    mockApplicationRepository.find.mockResolvedValue([]);
    mockApplicationRepository.createQueryBuilder.mockReturnValue(mockQuery);
    mockApplicationSubmissionRepository.find.mockResolvedValue([]);
    mockApplicationSubmissionRepository.createQueryBuilder.mockReturnValue(
      mockQuery,
    );

    const result = await service.searchApplications(mockSearchRequestDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockApplicationRepository.find).toHaveBeenCalledTimes(3);
    expect(mockApplicationRepository.createQueryBuilder).toHaveBeenCalledTimes(
      2,
    );
    expect(
      mockApplicationSubmissionRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(3);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(6);
  });

  it('should call compileApplicationSearchQuery method correctly', async () => {
    const searchForFilerNumbers = jest
      .spyOn(service as any, 'searchForFilerNumbers')
      .mockResolvedValue(new Set('100000'));

    mockApplicationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.searchApplications(mockSearchRequestDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(searchForFilerNumbers).toHaveBeenCalledWith(mockSearchRequestDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

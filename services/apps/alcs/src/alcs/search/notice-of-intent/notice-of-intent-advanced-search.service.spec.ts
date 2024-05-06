import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockQuery } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { NoticeOfIntent } from '../../notice-of-intent/notice-of-intent.entity';
import { SearchRequestDto } from '../search.dto';
import { NoticeOfIntentAdvancedSearchService } from './notice-of-intent-advanced-search.service';
import { NoticeOfIntentSubmissionSearchView } from './notice-of-intent-search-view.entity';

describe('NoticeOfIntentService', () => {
  let service: NoticeOfIntentAdvancedSearchService;
  let mockNoticeOfIntentSubmissionSearchViewRepository: DeepMocked<
    Repository<NoticeOfIntentSubmissionSearchView>
  >;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  let mockNOIRepository: DeepMocked<Repository<NoticeOfIntent>>;
  let mockNOISubmissionRepository: DeepMocked<
    Repository<NoticeOfIntentSubmission>
  >;
  let mockRedisService: DeepMocked<RedisService>;

  const sortFields = [
    'fileId',
    'type',
    'government',
    'portalStatus',
    'dateSubmitted',
  ];

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
    mockNoticeOfIntentSubmissionSearchViewRepository = createMock();
    mockLocalGovernmentRepository = createMock();
    mockNOIRepository = createMock();
    mockNOISubmissionRepository = createMock();
    mockRedisService = createMock();

    mockQuery = createMockQuery();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentAdvancedSearchService,
        {
          provide: getRepositoryToken(NoticeOfIntentSubmissionSearchView),
          useValue: mockNoticeOfIntentSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: mockNOIRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentSubmission),
          useValue: mockNOISubmissionRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentAdvancedSearchService>(
      NoticeOfIntentAdvancedSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
    );

    mockNoticeOfIntentSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
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
    mockNOIRepository.find.mockResolvedValue([]);
    mockNOIRepository.createQueryBuilder.mockReturnValue(mockQuery);
    mockNOISubmissionRepository.createQueryBuilder.mockReturnValue(mockQuery);

    const result = await service.searchNoticeOfIntents(
      mockSearchDto,
      {} as any,
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(9);
    expect(mockQuery.where).toHaveBeenCalledTimes(1);
    expect(mockNOIRepository.find).toHaveBeenCalledTimes(3);
    expect(mockNOIRepository.createQueryBuilder).toHaveBeenCalledTimes(3);
    expect(
      mockNOISubmissionRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(3);
  });

  it('should call searchForFileNumbers method correctly', async () => {
    const searchForFileNumbersSpy = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue(new Set(['100000']));

    const result = await service.searchNoticeOfIntents(
      mockSearchDto,
      {} as any,
    );

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

      const result = await service.searchNoticeOfIntents(
        mockSearchDto,
        {} as any,
      );

      expect(result).toEqual({ data: [], total: 0 });
      expect(searchForFileNumbersSpy).toHaveBeenCalledWith(mockSearchDto);
      expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
      expect(mockQuery.offset).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    });
  });
});

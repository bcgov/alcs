import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockQuery } from '../../../../../test/mocks/mockTypes';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { NoticeOfIntent } from '../../../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentSubmission } from '../../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { SearchRequestDto } from '../public-search.dto';
import { PublicNoticeOfIntentSubmissionSearchView } from './public-notice-of-intent-search-view.entity';
import { PublicNoticeOfIntentSearchService } from './public-notice-of-intent-search.service';

describe('PublicNoticeOfIntentSearchService', () => {
  let service: PublicNoticeOfIntentSearchService;
  let mockNoticeOfIntentSubmissionSearchViewRepository: DeepMocked<
    Repository<PublicNoticeOfIntentSubmissionSearchView>
  >;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  let mockNOIRepository: DeepMocked<Repository<NoticeOfIntent>>;
  let mockNOISubmissionRepository: DeepMocked<
    Repository<NoticeOfIntentSubmission>
  >;
  let mockRedisService: DeepMocked<RedisService>;

  const mockSearchDto: SearchRequestDto = {
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
    mockNoticeOfIntentSubmissionSearchViewRepository = createMock();
    mockLocalGovernmentRepository = createMock();
    mockNOIRepository = createMock();
    mockNOISubmissionRepository = createMock();
    mockRedisService = createMock();

    mockQuery = createMockQuery();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicNoticeOfIntentSearchService,
        {
          provide: getRepositoryToken(PublicNoticeOfIntentSubmissionSearchView),
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

    service = module.get<PublicNoticeOfIntentSearchService>(
      PublicNoticeOfIntentSearchService,
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
    mockNoticeOfIntentSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery,
    );
    mockNOIRepository.find.mockResolvedValue([]);
    mockNOIRepository.createQueryBuilder.mockReturnValue(mockQuery);
    mockNOISubmissionRepository.createQueryBuilder.mockReturnValue(mockQuery);

    const result = await service.searchNoticeOfIntents(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockNOIRepository.find).toHaveBeenCalledTimes(3);
    expect(mockNOIRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(
      mockNOISubmissionRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(3);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(5);
  });

  it('should call compileNoticeOfIntentSearchQuery method correctly', async () => {
    const searchForFileNumbers = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue(new Set('100000'));

    mockNoticeOfIntentSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery,
    );

    const result = await service.searchNoticeOfIntents(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(searchForFileNumbers).toHaveBeenCalledWith(mockSearchDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

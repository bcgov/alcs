import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockQuery } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntent } from '../../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentSubmission } from '../../notice-of-intent-submission/notice-of-intent-submission.entity';
import { InboxRequestDto } from '../inbox.dto';
import { InboxNoticeOfIntentSubmissionView } from './inbox-notice-of-intent-view.entity';
import { InboxNoticeOfIntentService } from './inbox-notice-of-intent.service';

describe('InboxNoticeOfIntentService', () => {
  let service: InboxNoticeOfIntentService;
  let mockNoticeOfIntentSubmissionSearchViewRepository: DeepMocked<
    Repository<InboxNoticeOfIntentSubmissionView>
  >;
  let mockNOIRepository: DeepMocked<Repository<NoticeOfIntent>>;
  let mockNOISubRepository: DeepMocked<Repository<NoticeOfIntentSubmission>>;
  let mockRedisService: DeepMocked<RedisService>;

  const mockSearchDto: InboxRequestDto = {
    fileNumber: '100000',
    portalStatusCodes: ['A'],
    governmentFileNumber: 'B',
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    fileTypes: ['NOI'],
    page: 1,
    pageSize: 10,
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockNoticeOfIntentSubmissionSearchViewRepository = createMock();
    mockNOIRepository = createMock();
    mockNOISubRepository = createMock();
    mockRedisService = createMock();

    mockQuery = createMockQuery();

    mockRedisService.getClient.mockReturnValue({
      get: async () => null,
      setEx: async () => null,
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxNoticeOfIntentService,
        {
          provide: getRepositoryToken(InboxNoticeOfIntentSubmissionView),
          useValue: mockNoticeOfIntentSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntent),
          useValue: mockNOIRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentSubmission),
          useValue: mockNOISubRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<InboxNoticeOfIntentService>(
      InboxNoticeOfIntentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockNOIRepository.find.mockResolvedValue([]);
    mockNOISubRepository.createQueryBuilder.mockReturnValue(mockQuery);

    const result = await service.searchNoticeOfIntents(
      mockSearchDto,
      '',
      '',
      '',
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockNOIRepository.find).toHaveBeenCalledTimes(2);
    expect(mockNOISubRepository.createQueryBuilder).toHaveBeenCalledTimes(3);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(3);
  });

  it('should call searchForFileNumbers method correctly', async () => {
    mockNoticeOfIntentSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery,
    );

    const compileApplicationSearchQuerySpy = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue({
        didSearch: true,
        finalResult: new Set(['100000']),
      });

    const result = await service.searchNoticeOfIntents(
      mockSearchDto,
      '',
      '',
      '',
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileApplicationSearchQuerySpy).toHaveBeenCalledWith(
      mockSearchDto,
    );
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InboxRequestDto } from '../inbox.dto';
import { InboxNoticeOfIntentSubmissionView } from './inbox-notice-of-intent-view.entity';
import { InboxNoticeOfIntentService } from './inbox-notice-of-intent.service';

describe('InboxNoticeOfIntentService', () => {
  let service: InboxNoticeOfIntentService;
  let mockNoticeOfIntentSubmissionSearchViewRepository: DeepMocked<
    Repository<InboxNoticeOfIntentSubmissionView>
  >;

  const mockSearchDto: InboxRequestDto = {
    fileNumber: '123',
    portalStatusCodes: ['A'],
    governmentFileNumber: 'B',
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    fileTypes: ['type1', 'type2'],
    page: 1,
    pageSize: 10,
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockNoticeOfIntentSubmissionSearchViewRepository = createMock();

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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxNoticeOfIntentService,
        {
          provide: getRepositoryToken(InboxNoticeOfIntentSubmissionView),
          useValue: mockNoticeOfIntentSubmissionSearchViewRepository,
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
    mockNoticeOfIntentSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.searchNoticeOfIntents(
      mockSearchDto,
      '',
      '',
      '',
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(
      mockNoticeOfIntentSubmissionSearchViewRepository.createQueryBuilder,
    ).toBeCalledTimes(1);
    expect(mockQuery.andWhere).toBeCalledTimes(6);
  });

  it('should call compileNoticeOfIntentSearchQuery method correctly', async () => {
    const compileApplicationSearchQuerySpy = jest
      .spyOn(service as any, 'compileNoticeOfIntentSearchQuery')
      .mockResolvedValue(mockQuery);

    const result = await service.searchNoticeOfIntents(
      mockSearchDto,
      '',
      '',
      '',
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileApplicationSearchQuerySpy).toBeCalledWith(
      mockSearchDto,
      '',
      '',
      '',
    );
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

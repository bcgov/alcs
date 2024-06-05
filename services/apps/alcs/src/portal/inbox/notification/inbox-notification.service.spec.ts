import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockQuery } from '../../../../test/mocks/mockTypes';
import { Notification } from '../../../alcs/notification/notification.entity';
import { NotificationSubmission } from '../../notification-submission/notification-submission.entity';
import { InboxRequestDto } from '../inbox.dto';
import { InboxNotificationSubmissionView } from './inbox-notification-view.entity';
import { InboxNotificationService } from './inbox-notification.service';

describe('InboxNotificationService', () => {
  let service: InboxNotificationService;
  let mockNotificationSubmissionSearchViewRepository: DeepMocked<
    Repository<InboxNotificationSubmissionView>
  >;
  let mockNotificationRepository: DeepMocked<Repository<Notification>>;
  let mockNotificationSubmissionRepository: DeepMocked<
    Repository<NotificationSubmission>
  >;
  let mockRedisService: DeepMocked<RedisService>;

  const mockSearchDto: InboxRequestDto = {
    fileNumber: '100000',
    portalStatusCodes: ['A'],
    governmentFileNumber: 'B',
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    fileTypes: ['SRW'],
    page: 1,
    pageSize: 10,
    createdByMe: false,
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockNotificationSubmissionSearchViewRepository = createMock();
    mockNotificationRepository = createMock();
    mockNotificationSubmissionRepository = createMock();
    mockRedisService = createMock();

    mockQuery = createMockQuery();

    mockRedisService.getClient.mockReturnValue({
      get: async () => null,
      setEx: async () => null,
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxNotificationService,
        {
          provide: getRepositoryToken(InboxNotificationSubmissionView),
          useValue: mockNotificationSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(NotificationSubmission),
          useValue: mockNotificationSubmissionRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<InboxNotificationService>(InboxNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockNotificationRepository.find.mockResolvedValue([]);
    mockNotificationSubmissionRepository.createQueryBuilder.mockReturnValue(
      mockQuery,
    );

    const result = await service.search(mockSearchDto, '', '', '');

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockNotificationRepository.find).toHaveBeenCalledTimes(2);
    expect(
      mockNotificationSubmissionRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(3);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(3);
  });

  it('should call searchForFileNumbers method correctly', async () => {
    mockNotificationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery,
    );

    const searchForFileNumbersSpy = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue({
        didSearch: true,
        finalResult: new Set(['100000']),
      });

    const result = await service.search(mockSearchDto, '', '', '');

    expect(result).toEqual({ data: [], total: 0 });
    expect(searchForFileNumbersSpy).toHaveBeenCalledWith(mockSearchDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    expect(
      mockNotificationSubmissionSearchViewRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(1);
  });
});

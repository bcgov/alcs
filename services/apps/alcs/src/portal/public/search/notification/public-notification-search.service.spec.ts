import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockQuery } from '../../../../../test/mocks/mockTypes';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { Notification } from '../../../../alcs/notification/notification.entity';
import { NotificationSubmission } from '../../../notification-submission/notification-submission.entity';
import { SearchRequestDto } from '../public-search.dto';
import { PublicNotificationSubmissionSearchView } from './public-notification-search-view.entity';
import { PublicNotificationSearchService } from './public-notification-search.service';

describe('PublicNotificationSearchService', () => {
  let service: PublicNotificationSearchService;
  let mockNotificationSubmissionSearchViewRepository: DeepMocked<
    Repository<PublicNotificationSubmissionSearchView>
  >;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  let mockNotificationRepository: DeepMocked<Repository<Notification>>;
  let mockNotificationSubmissionRepository: DeepMocked<
    Repository<NotificationSubmission>
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
    mockNotificationSubmissionSearchViewRepository = createMock();
    mockLocalGovernmentRepository = createMock();
    mockNotificationRepository = createMock();
    mockNotificationSubmissionRepository = createMock();
    mockRedisService = createMock();

    mockQuery = createMockQuery();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicNotificationSearchService,
        {
          provide: getRepositoryToken(PublicNotificationSubmissionSearchView),
          useValue: mockNotificationSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
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

    service = module.get<PublicNotificationSearchService>(
      PublicNotificationSearchService,
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
    mockNotificationRepository.find.mockResolvedValue([]);
    mockNotificationSubmissionRepository.find.mockResolvedValue([]);
    mockNotificationSubmissionRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.search(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockNotificationRepository.find).toHaveBeenCalledTimes(3);
    expect(
      mockNotificationSubmissionRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(3);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(3);
  });

  it('should call searchForFileNumbers method correctly', async () => {
    const searchForFileNumbers = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue(new Set('100000'));

    mockNotificationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.search(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(searchForFileNumbers).toHaveBeenCalledWith(mockSearchDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

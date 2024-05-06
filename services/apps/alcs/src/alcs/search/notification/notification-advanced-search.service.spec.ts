import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockQuery } from '../../../../test/mocks/mockTypes';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { Notification } from '../../notification/notification.entity';
import { SearchRequestDto } from '../search.dto';
import { NotificationAdvancedSearchService } from './notification-advanced-search.service';
import { NotificationSubmissionSearchView } from './notification-search-view.entity';

describe('NotificationAdvancedSearchService', () => {
  let service: NotificationAdvancedSearchService;
  let mockNotificationSubmissionSearchViewRepository: DeepMocked<
    Repository<NotificationSubmissionSearchView>
  >;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  let mockNotificationRepo: DeepMocked<Repository<Notification>>;
  let mockNotificationSubmissionRepo: DeepMocked<
    Repository<NotificationSubmission>
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
    mockNotificationSubmissionSearchViewRepository = createMock();
    mockLocalGovernmentRepository = createMock();
    mockNotificationRepo = createMock();
    mockNotificationSubmissionRepo = createMock();
    mockRedisService = createMock();

    mockQuery = createMockQuery();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationAdvancedSearchService,
        {
          provide: getRepositoryToken(NotificationSubmissionSearchView),
          useValue: mockNotificationSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepo,
        },
        {
          provide: getRepositoryToken(NotificationSubmission),
          useValue: mockNotificationSubmissionRepo,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<NotificationAdvancedSearchService>(
      NotificationAdvancedSearchService,
    );

    mockNotificationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
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
    mockNotificationRepo.find.mockResolvedValue([]);
    mockNotificationRepo.createQueryBuilder.mockReturnValue(mockQuery);
    mockNotificationSubmissionRepo.createQueryBuilder.mockReturnValue(
      mockQuery,
    );

    const result = await service.search(mockSearchDto, {} as any);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(4);
    expect(
      mockNotificationSubmissionRepo.createQueryBuilder,
    ).toHaveBeenCalledTimes(3);
    expect(mockNotificationRepo.createQueryBuilder).toHaveBeenCalledTimes(2);
    expect(mockNotificationRepo.find).toHaveBeenCalledTimes(3);
  });

  it('should call searchForFileNumbers method correctly', async () => {
    const searchForFileNumbersSpy = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue(new Set(['100000']));

    const result = await service.search(mockSearchDto, {} as any);

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

      const result = await service.search(mockSearchDto, {} as any);

      expect(result).toEqual({ data: [], total: 0 });
      expect(searchForFileNumbersSpy).toHaveBeenCalledWith(mockSearchDto);
      expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
      expect(mockQuery.offset).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    });
  });
});

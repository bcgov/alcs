import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { SearchRequestDto } from '../search.dto';
import { NotificationAdvancedSearchService } from './notification-advanced-search.service';
import { NotificationSubmissionSearchView } from './notification-search-view.entity';

describe('NotificationAdvancedSearchService', () => {
  let service: NotificationAdvancedSearchService;
  let mockNotificationSubmissionSearchViewRepository: DeepMocked<
    Repository<NotificationSubmissionSearchView>
  >;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;

  const mockSearchDto: SearchRequestDto = {
    fileNumber: '123',
    portalStatusCode: 'A',
    governmentName: 'B',
    regionCode: 'C',
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    isIncludeOtherParcels: false,
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
        NotificationAdvancedSearchService,
        {
          provide: getRepositoryToken(NotificationSubmissionSearchView),
          useValue: mockNotificationSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationAdvancedSearchService>(
      NotificationAdvancedSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockNotificationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.search(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(
      mockNotificationSubmissionSearchViewRepository.createQueryBuilder,
    ).toBeCalledTimes(1);
    expect(mockQuery.andWhere).toBeCalledTimes(9);
  });

  it('should call compileNotificationSearchQuery method correctly', async () => {
    const compileSearchQuerySpy = jest
      .spyOn(service as any, 'compileNotificationSearchQuery')
      .mockResolvedValue(mockQuery);

    const result = await service.search(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileSearchQuerySpy).toBeCalledWith(mockSearchDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

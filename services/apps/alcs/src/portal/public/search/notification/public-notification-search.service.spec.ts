import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { SearchRequestDto } from '../public-search.dto';
import { PublicNotificationSearchService } from './public-notification-search.service';
import { PublicNotificationSubmissionSearchView } from './public-notification-search-view.entity';

describe('PublicNotificationSearchService', () => {
  let service: PublicNotificationSearchService;
  let mockNotificationSubmissionSearchViewRepository: DeepMocked<
    Repository<PublicNotificationSubmissionSearchView>
  >;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;

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
        PublicNotificationSearchService,
        {
          provide: getRepositoryToken(PublicNotificationSubmissionSearchView),
          useValue: mockNotificationSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
      ],
    }).compile();

    service = module.get<PublicNotificationSearchService>(
      PublicNotificationSearchService,
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
    expect(mockQuery.andWhere).toBeCalledTimes(7);
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

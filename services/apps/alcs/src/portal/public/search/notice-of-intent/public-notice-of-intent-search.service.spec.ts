import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalGovernment } from '../../../../alcs/local-government/local-government.entity';
import { SearchRequestDto } from '../public-search.dto';
import { PublicNoticeOfIntentSearchService } from './public-notice-of-intent-search.service';
import { PublicNoticeOfIntentSubmissionSearchView } from './public-notice-of-intent-search-view.entity';

describe('PublicNoticeOfIntentSearchService', () => {
  let service: PublicNoticeOfIntentSearchService;
  let mockNoticeOfIntentSubmissionSearchViewRepository: DeepMocked<
    Repository<PublicNoticeOfIntentSubmissionSearchView>
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
    mockNoticeOfIntentSubmissionSearchViewRepository = createMock();
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
        PublicNoticeOfIntentSearchService,
        {
          provide: getRepositoryToken(PublicNoticeOfIntentSubmissionSearchView),
          useValue: mockNoticeOfIntentSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
      ],
    }).compile();

    service = module.get<PublicNoticeOfIntentSearchService>(
      PublicNoticeOfIntentSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockNoticeOfIntentSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.searchNoticeOfIntents(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(
      mockNoticeOfIntentSubmissionSearchViewRepository.createQueryBuilder,
    ).toBeCalledTimes(1);
    expect(mockQuery.andWhere).toBeCalledTimes(9);
  });

  it('should call compileNoticeOfIntentSearchQuery method correctly', async () => {
    const compileApplicationSearchQuerySpy = jest
      .spyOn(service as any, 'compileNoticeOfIntentSearchQuery')
      .mockResolvedValue(mockQuery);

    const result = await service.searchNoticeOfIntents(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileApplicationSearchQuerySpy).toBeCalledWith(mockSearchDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

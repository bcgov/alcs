import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { createMockQuery } from '../../../../test/mocks/mockTypes';
import { Inquiry } from '../../inquiry/inquiry.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { SearchRequestDto } from '../search.dto';
import { InquiryAdvancedSearchService } from './inquiry-advanced-search.service';
import { InquirySearchView } from './inquiry-search-view.entity';

describe('InquiryAdvancedSearchService', () => {
  let service: InquiryAdvancedSearchService;
  let mockInquirySearchViewRepository: DeepMocked<
    Repository<InquirySearchView>
  >;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  let mockInquiryRepository: DeepMocked<Repository<Inquiry>>;
  let mockRedisService: DeepMocked<RedisService>;
  let mockQueryRunner: DeepMocked<QueryRunner>;

  const sortFields = [
    'fileId',
    'type',
    'government',
    'status',
    'dateSubmitted',
  ];

  const mockSearchDto: SearchRequestDto = {
    fileNumber: '123',
    governmentName: 'B',
    regionCode: 'C',
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    dateSubmittedFrom: new Date('2020-10-10').getTime(),
    dateSubmittedTo: new Date('2021-10-10').getTime(),
    fileTypes: ['type1', 'type2'],
    page: 1,
    pageSize: 10,
    sortField: 'applicant',
    sortDirection: 'ASC',
    portalStatusCodes: [],
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockInquirySearchViewRepository = createMock();
    mockLocalGovernmentRepository = createMock();
    mockInquiryRepository = createMock();
    mockRedisService = createMock();

    mockQuery = createMockQuery();
    mockQueryRunner = createMock();

    mockRedisService.getClient.mockReturnValue({
      get: async () => null,
      setEx: async () => null,
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiryAdvancedSearchService,
        {
          provide: getRepositoryToken(InquirySearchView),
          useValue: mockInquirySearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
        {
          provide: getRepositoryToken(Inquiry),
          useValue: mockInquiryRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<InquiryAdvancedSearchService>(
      InquiryAdvancedSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
    );

    mockInquirySearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery,
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
    mockInquiryRepository.find.mockResolvedValue([]);
    mockInquiryRepository.createQueryBuilder.mockReturnValue(mockQuery);

    const result = await service.search(mockSearchDto, mockQueryRunner);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockInquiryRepository.find).toHaveBeenCalledTimes(3);
    expect(mockInquiryRepository.createQueryBuilder).toHaveBeenCalledTimes(4);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(4);
  });

  it('should call searchForFileNumbers method correctly', async () => {
    const searchForFileNumbersSpy = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue(new Set(['100000']));

    const result = await service.search(mockSearchDto, mockQueryRunner);

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

      const result = await service.search(mockSearchDto, mockQueryRunner);

      expect(result).toEqual({ data: [], total: 0 });
      expect(searchForFileNumbersSpy).toHaveBeenCalledWith(mockSearchDto);
      expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
      expect(mockQuery.offset).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    });
  });
});

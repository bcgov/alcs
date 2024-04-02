import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockInquirySearchViewRepository = createMock();
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
      withDeleted: jest.fn().mockReturnThis(),
    };

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
      ],
    }).compile();

    service = module.get<InquiryAdvancedSearchService>(
      InquiryAdvancedSearchService,
    );

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(
      new LocalGovernment(),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockInquirySearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.search(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(
      mockInquirySearchViewRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(1);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(9);
  });

  it('should call compileInquirySearchQuery method correctly', async () => {
    const compileSearchQuerySpy = jest
      .spyOn(service as any, 'compileInquirySearchQuery')
      .mockResolvedValue(mockQuery);

    const result = await service.search(mockSearchDto);

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileSearchQuerySpy).toHaveBeenCalledWith(mockSearchDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });

  sortFields.forEach((sortField) => {
    it(`should sort by ${sortField}`, async () => {
      const compileSearchQuerySpy = jest
        .spyOn(service as any, 'compileInquirySearchQuery')
        .mockResolvedValue(mockQuery);

      mockSearchDto.sortField = sortField;
      mockSearchDto.sortDirection = 'DESC';

      const result = await service.search(mockSearchDto);

      expect(result).toEqual({ data: [], total: 0 });
      expect(compileSearchQuerySpy).toHaveBeenCalledWith(mockSearchDto);
      expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
      expect(mockQuery.offset).toHaveBeenCalledTimes(1);
      expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    });
  });
});

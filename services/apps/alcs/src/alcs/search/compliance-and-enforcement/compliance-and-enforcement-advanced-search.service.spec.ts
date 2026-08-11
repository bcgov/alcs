import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { createMockQuery } from '../../../../test/mocks/mockTypes';
import { ComplianceAndEnforcement } from '../../compliance-and-enforcement/compliance-and-enforcement.entity';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { SearchRequestDto } from '../search.dto';
import { ComplianceAndEnforcementAdvancedSearchService } from './compliance-and-enforcement-advanced-search.service';

describe('ComplianceAndEnforcementAdvancedSearchService', () => {
  let service: ComplianceAndEnforcementAdvancedSearchService;
  let mockComplianceAndEnforcementSearchViewRepository: DeepMocked<Repository<ComplianceAndEnforcementSearchView>>;
  let mockLocalGovernmentRepository: DeepMocked<Repository<LocalGovernment>>;
  let mockComplianceAndEnforcementRepository: DeepMocked<Repository<ComplianceAndEnforcement>>;
  let mockRedisService: DeepMocked<RedisService>;
  let mockQueryRunner: DeepMocked<QueryRunner>;

  const sortFields = ['fileId', 'type', 'government', 'status', 'dateSubmitted'];

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
    legacyId: 'legacyId',
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockComplianceAndEnforcementSearchViewRepository = createMock();
    mockLocalGovernmentRepository = createMock();
    mockComplianceAndEnforcementRepository = createMock();
    mockRedisService = createMock();

    mockQuery = createMockQuery();
    mockQueryRunner = createMock();

    mockRedisService.getClient.mockReturnValue({
      get: async () => null,
      setEx: async () => null,
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceAndEnforcementAdvancedSearchService,
        {
          provide: getRepositoryToken(ComplianceAndEnforcementSearchView),
          useValue: mockComplianceAndEnforcementSearchViewRepository,
        },
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockLocalGovernmentRepository,
        },
        {
          provide: getRepositoryToken(ComplianceAndEnforcement),
          useValue: mockComplianceAndEnforcementRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ComplianceAndEnforcementAdvancedSearchService>(ComplianceAndEnforcementAdvancedSearchService);

    mockLocalGovernmentRepository.findOneByOrFail.mockResolvedValue(new LocalGovernment());

    mockComplianceAndEnforcementSearchViewRepository.createQueryBuilder.mockReturnValue(mockQuery);

    mockRedisService.getClient.mockReturnValue({
      get: async () => null,
      setEx: async () => null,
    } as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockComplianceAndEnforcementRepository.find.mockResolvedValue([]);
    mockComplianceAndEnforcementRepository.createQueryBuilder.mockReturnValue(mockQuery);

    const result = await service.search(mockSearchDto, mockQueryRunner);

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockComplianceAndEnforcementRepository.find).toHaveBeenCalledTimes(4);
    expect(mockComplianceAndEnforcementRepository.createQueryBuilder).toHaveBeenCalledTimes(4);
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

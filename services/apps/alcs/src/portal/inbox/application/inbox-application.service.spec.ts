import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockQuery } from '../../../../test/mocks/mockTypes';
import { Application } from '../../../alcs/application/application.entity';
import { ApplicationSubmissionReview } from '../../application-submission-review/application-submission-review.entity';
import { ApplicationSubmission } from '../../application-submission/application-submission.entity';
import { InboxRequestDto } from '../inbox.dto';
import { InboxApplicationSubmissionView } from './inbox-application-view.entity';
import { InboxApplicationService } from './inbox-application.service';

describe('InboxApplicationService', () => {
  let service: InboxApplicationService;
  let mockApplicationSubmissionSearchViewRepository: DeepMocked<
    Repository<InboxApplicationSubmissionView>
  >;
  let mockApplicationRepository: DeepMocked<Repository<Application>>;
  let mockApplicationSubmissionRepository: DeepMocked<
    Repository<ApplicationSubmission>
  >;
  let mockRedisService: DeepMocked<RedisService>;
  let mockApplicationReviewRepository: DeepMocked<
    Repository<ApplicationSubmissionReview>
  >;

  const mockSearchRequestDto: InboxRequestDto = {
    fileNumber: '100000',
    portalStatusCodes: ['A'],
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    fileTypes: ['type1', 'type2'],
    page: 1,
    pageSize: 10,
    createdByMe: false,
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockApplicationSubmissionSearchViewRepository = createMock();
    mockApplicationRepository = createMock();
    mockApplicationSubmissionRepository = createMock();
    mockRedisService = createMock();
    mockApplicationReviewRepository = createMock();

    mockQuery = createMockQuery();

    mockRedisService.getClient.mockReturnValue({
      get: async () => null,
      setEx: async () => null,
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxApplicationService,
        {
          provide: getRepositoryToken(InboxApplicationSubmissionView),
          useValue: mockApplicationSubmissionSearchViewRepository,
        },
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationSubmission),
          useValue: mockApplicationSubmissionRepository,
        },
        {
          provide: getRepositoryToken(ApplicationSubmissionReview),
          useValue: mockApplicationReviewRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<InboxApplicationService>(InboxApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockApplicationRepository.find.mockResolvedValue([]);
    mockApplicationRepository.createQueryBuilder.mockReturnValue(mockQuery);
    mockApplicationSubmissionRepository.createQueryBuilder.mockReturnValue(
      mockQuery,
    );

    const result = await service.searchApplications(
      mockSearchRequestDto,
      '',
      '',
      '',
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(mockApplicationRepository.find).toHaveBeenCalledTimes(1);
    expect(mockApplicationRepository.createQueryBuilder).toHaveBeenCalledTimes(
      1,
    );
    expect(
      mockApplicationSubmissionRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(3);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(3);
  });

  it('should call searchForFileNumbers method correctly', async () => {
    mockApplicationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery,
    );

    const searchForFileNumbersSpy = jest
      .spyOn(service as any, 'searchForFileNumbers')
      .mockResolvedValue({
        didSearch: true,
        finalResult: new Set(['100000']),
      });

    const result = await service.searchApplications(
      mockSearchRequestDto,
      '',
      '',
      '',
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(searchForFileNumbersSpy).toHaveBeenCalledWith(mockSearchRequestDto);
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionSearchViewRepository.createQueryBuilder,
    ).toHaveBeenCalledTimes(1);
  });
});

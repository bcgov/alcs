import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { SearchStatusService } from './search-status.service';
import { ApplicationSubmissionStatusSearchView } from './application-search-status-view.entity';
import { NoiSubmissionStatusSearchView } from './noi-search-status-view.entity';
import { NotificationSubmissionStatusSearchView } from './notification-search-status-view.entity';
import { createMockQuery } from '../../../../test/mocks/mockTypes';

describe('SearchStatusService', () => {
  let service: SearchStatusService;
  let mockApplicationRepository: DeepMocked<Repository<ApplicationSubmissionStatusSearchView>>;
  let mockNoiRepository: DeepMocked<Repository<NoiSubmissionStatusSearchView>>;
  let mockNotificationRepository: DeepMocked<Repository<NotificationSubmissionStatusSearchView>>;

  let mockQuery: any = {};

  beforeEach(async () => {
    mockApplicationRepository = createMock();
    mockNoiRepository = createMock();
    mockNotificationRepository = createMock();
    mockQuery = createMockQuery();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchStatusService,
        {
          provide: getRepositoryToken(ApplicationSubmissionStatusSearchView),
          useValue: mockApplicationRepository,
        },
        {
          provide: getRepositoryToken(NoiSubmissionStatusSearchView),
          useValue: mockNoiRepository,
        },
        {
          provide: getRepositoryToken(NotificationSubmissionStatusSearchView),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<SearchStatusService>(SearchStatusService);

    mockApplicationRepository.createQueryBuilder.mockReturnValue(mockQuery as any);
    mockNoiRepository.createQueryBuilder.mockReturnValue(mockQuery as any);
    mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQuery as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repository to get aplication status', async () => {
    mockApplicationRepository.createQueryBuilder.mockReturnValue(mockQuery);

    const mockQueryRunner = createMock<QueryRunner>();

    const result = await service.searchApplicationStatus(['file1', 'file2'], mockQueryRunner);

    expect(result).toEqual([]);
    expect(mockApplicationRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(1);
  });

  it('should call repository to get noi status', async () => {
    mockNoiRepository.createQueryBuilder.mockReturnValue(mockQuery);

    const mockQueryRunner = createMock<QueryRunner>();

    const result = await service.searchNoiStatus(['file1', 'file2'], mockQueryRunner);

    expect(result).toEqual([]);
    expect(mockNoiRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(1);
  });

  it('should call repository to get notification status', async () => {
    mockNotificationRepository.createQueryBuilder.mockReturnValue(mockQuery);

    const mockQueryRunner = createMock<QueryRunner>();

    const result = await service.searchNotificationStatus(['file1', 'file2'], mockQueryRunner);

    expect(result).toEqual([]);
    expect(mockNotificationRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(mockQuery.andWhere).toHaveBeenCalledTimes(1);
  });
});

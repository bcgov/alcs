import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InboxRequestDto } from '../inbox.dto';
import { InboxNotificationService } from './inbox-notification.service';
import { InboxNotificationSubmissionView } from './inbox-notification-view.entity';

describe('InboxNotificationService', () => {
  let service: InboxNotificationService;
  let mockNotificationSubmissionSearchViewRepository: DeepMocked<
    Repository<InboxNotificationSubmissionView>
  >;

  const mockSearchDto: InboxRequestDto = {
    fileNumber: '123',
    portalStatusCodes: ['A'],
    governmentFileNumber: 'B',
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    fileTypes: ['type1', 'type2'],
    page: 1,
    pageSize: 10,
    sortField: 'ownerName',
    sortDirection: 'ASC',
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockNotificationSubmissionSearchViewRepository = createMock();

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
        InboxNotificationService,
        {
          provide: getRepositoryToken(InboxNotificationSubmissionView),
          useValue: mockNotificationSubmissionSearchViewRepository,
        },
      ],
    }).compile();

    service = module.get<InboxNotificationService>(InboxNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockNotificationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.search(mockSearchDto, '', '', '');

    expect(result).toEqual({ data: [], total: 0 });
    expect(
      mockNotificationSubmissionSearchViewRepository.createQueryBuilder,
    ).toBeCalledTimes(1);
    expect(mockQuery.andWhere).toBeCalledTimes(6);
  });

  it('should call compileNotificationSearchQuery method correctly', async () => {
    const compileSearchQuerySpy = jest
      .spyOn(service as any, 'compileNotificationSearchQuery')
      .mockResolvedValue(mockQuery);

    const result = await service.search(mockSearchDto, '', '', '');

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileSearchQuerySpy).toBeCalledWith(mockSearchDto, '', '', '');
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

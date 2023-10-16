import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InboxRequestDto } from '../inbox.dto';
import { InboxApplicationSubmissionView } from './inbox-application-view.entity';
import { InboxApplicationService } from './inbox-application.service';

describe('InboxApplicationService', () => {
  let service: InboxApplicationService;
  let mockApplicationSubmissionSearchViewRepository: DeepMocked<
    Repository<InboxApplicationSubmissionView>
  >;

  const mockSearchRequestDto: InboxRequestDto = {
    fileNumber: '123',
    portalStatusCodes: ['A'],
    name: 'D',
    pid: 'E',
    civicAddress: 'F',
    fileTypes: ['type1', 'type2'],
    page: 1,
    pageSize: 10,
  };

  let mockQuery: any = {};

  beforeEach(async () => {
    mockApplicationSubmissionSearchViewRepository = createMock();

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
        InboxApplicationService,
        {
          provide: getRepositoryToken(InboxApplicationSubmissionView),
          useValue: mockApplicationSubmissionSearchViewRepository,
        },
      ],
    }).compile();

    service = module.get<InboxApplicationService>(InboxApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully build a query using all search parameters defined', async () => {
    mockApplicationSubmissionSearchViewRepository.createQueryBuilder.mockReturnValue(
      mockQuery as any,
    );

    const result = await service.searchApplications(
      mockSearchRequestDto,
      '',
      '',
      '',
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(
      mockApplicationSubmissionSearchViewRepository.createQueryBuilder,
    ).toBeCalledTimes(1);
    expect(mockQuery.andWhere).toBeCalledTimes(8);
  });

  it('should call compileApplicationSearchQuery method correctly', async () => {
    const compileApplicationSearchQuerySpy = jest
      .spyOn(service as any, 'compileApplicationSearchQuery')
      .mockResolvedValue(mockQuery);

    const result = await service.searchApplications(
      mockSearchRequestDto,
      '',
      '',
      '',
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(compileApplicationSearchQuerySpy).toBeCalledWith(
      mockSearchRequestDto,
      '',
      '',
      '',
    );
    expect(mockQuery.orderBy).toHaveBeenCalledTimes(1);
    expect(mockQuery.offset).toHaveBeenCalledTimes(1);
    expect(mockQuery.limit).toHaveBeenCalledTimes(1);
  });
});

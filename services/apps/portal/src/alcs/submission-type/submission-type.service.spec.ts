import { RedisService } from '@app/common/redis/redis.service';
import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import {
  SubmissionType,
  SubmissionTypeService,
} from './submission-type.service';

describe('Service', () => {
  let service: SubmissionTypeService;
  let mockRedisService: DeepMocked<RedisService>;
  let mockRedis;

  const mockSubmissionTypes: SubmissionType[] = [
    {
      code: 'code',
      label: 'label',
      portalHtmlDescription: 'htmlDescription',
    },
  ];

  beforeEach(async () => {
    mockRedisService = createMock();
    mockRedis = createMock<{
      set: () => any;
      get: () => any;
    }>();
    mockRedis.set.mockResolvedValue(null);
    mockRedis.get.mockResolvedValue(JSON.stringify(mockSubmissionTypes));
    mockRedisService.getClient.mockReturnValue(mockRedis as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionTypeService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<SubmissionTypeService>(SubmissionTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load submission types from Redis', async () => {
    const submissionTypes = await service.list();

    expect(submissionTypes.length).toEqual(1);
    expect(submissionTypes).toEqual(mockSubmissionTypes);
    expect(mockRedis.get).toHaveBeenCalledTimes(1);
  });

  it('should return empty if submission types are not in Redis', async () => {
    mockRedis.get.mockResolvedValue(undefined);

    const submissionTypes = await service.list();

    expect(submissionTypes.length).toEqual(0);
  });
});

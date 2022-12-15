import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalGovernmentService } from './local-government.service';

describe('LocalGovernmentService', () => {
  let service: LocalGovernmentService;
  let mockRedisService: DeepMocked<RedisService>;
  let mockRedis;

  const mockLocalGovernments = [
    {
      name: 'fake-lg',
      uuid: 'fake-uuid',
    },
  ];

  beforeEach(async () => {
    mockRedisService = createMock();
    mockRedis = createMock<{
      set: () => any;
      get: () => any;
    }>();
    mockRedis.set.mockResolvedValue(null);
    mockRedis.get.mockResolvedValue(JSON.stringify(mockLocalGovernments));
    mockRedisService.getClient.mockReturnValue(mockRedis as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalGovernmentService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<LocalGovernmentService>(LocalGovernmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load local governments from Redis', async () => {
    const localGovernments = await service.get();

    expect(localGovernments.length).toEqual(1);
    expect(localGovernments).toEqual(mockLocalGovernments);
    expect(mockRedis.get).toHaveBeenCalledTimes(1);
  });
});

import { RedisService } from '@app/common/redis/redis.service';
import { DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import {
  LocalGovernment,
  LocalGovernmentService,
} from './local-government.service';

describe('LocalGovernmentService', () => {
  let service: LocalGovernmentService;
  let mockRedisService: DeepMocked<RedisService>;
  let mockRedis;

  const mockLocalGovernments: LocalGovernment[] = [
    {
      name: 'fake-lg',
      uuid: 'fake-uuid',
      isFirstNation: false,
    },
    {
      name: 'matching-lg',
      uuid: 'matching-uuid',
      bceidBusinessGuid: 'matching-guid',
      isFirstNation: false,
    },
  ];

  beforeEach(async () => {
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

    expect(localGovernments.length).toEqual(2);
    expect(localGovernments).toEqual(mockLocalGovernments);
    expect(mockRedis.get).toHaveBeenCalledTimes(1);
  });

  it('should load and match government to the given business guid', async () => {
    const localGovernment = await service.getByGuid('matching-guid');
    expect(localGovernment).toBeDefined();
    expect(localGovernment!.bceidBusinessGuid).toEqual('matching-guid');
    expect(mockRedis.get).toHaveBeenCalledTimes(1);
  });
});

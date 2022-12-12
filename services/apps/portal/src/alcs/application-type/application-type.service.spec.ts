import { RedisService } from '@app/common/redis/redis.service';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ApplicationTypeService,
  PortalApplicationType,
} from './application-type.service';

describe('ApplicationTypeService', () => {
  let service: ApplicationTypeService;
  let mockRedisService: DeepMocked<RedisService>;
  let mockRedis;

  const mockApplicationTypes: PortalApplicationType[] = [
    {
      portalLabel: 'portalLabel',
      code: 'code',
      label: 'label',
      htmlDescription: 'htmlDescription',
    },
  ];

  beforeEach(async () => {
    mockRedisService = createMock();
    mockRedis = createMock<{
      set: () => any;
      get: () => any;
    }>();
    mockRedis.set.mockResolvedValue(null);
    mockRedis.get.mockResolvedValue(JSON.stringify(mockApplicationTypes));
    mockRedisService.getClient.mockReturnValue(mockRedis as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTypeService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ApplicationTypeService>(ApplicationTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load application types from Redis', async () => {
    const applicationTypes = await service.list();

    expect(applicationTypes.length).toEqual(1);
    expect(applicationTypes).toEqual(mockApplicationTypes);
    expect(mockRedis.get).toHaveBeenCalledTimes(1);
  });

  it('should return empty if application types are not in Redis', async () => {
    mockRedis.get.mockResolvedValue(undefined);

    const applicationTypes = await service.list();

    expect(applicationTypes.length).toEqual(0);
  });

  it('should return the single fetched type', async () => {
    const applicationType = await service.get('code');

    expect(applicationType).toBeDefined();
    expect(applicationType).toEqual('portalLabel');
    expect(mockRedis.get).toHaveBeenCalledTimes(1);
  });

  it('should return empty string if passed an invalid type', async () => {
    const applicationType = await service.get('foobar');

    expect(applicationType).toEqual('');
    expect(mockRedis.get).toHaveBeenCalledTimes(1);
  });
});

import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../../common/redis/redis.service';
import { ApplicationLocalGovernment } from './application-local-government.entity';
import { ApplicationLocalGovernmentService } from './application-local-government.service';

describe('ApplicationLocalGovernmentService', () => {
  let mockRepository: DeepMocked<Repository<ApplicationLocalGovernment>>;

  let mockRedisService: DeepMocked<RedisService>;
  let mockRedis; //Redis type is a bit odd, does not work with createMock

  let service: ApplicationLocalGovernmentService;

  const mockLocalGovernments = [
    {
      name: 'lg-name',
      uuid: 'lg-uuid',
    } as any,
  ];

  beforeEach(async () => {
    mockRepository = createMock<Repository<ApplicationLocalGovernment>>();

    mockRepository.find.mockResolvedValue(mockLocalGovernments);

    mockRedisService = createMock();
    mockRedis = createMock<{
      set: () => any;
      get: () => any;
    }>();
    mockRedis.set.mockResolvedValue(null);
    mockRedisService.getClient.mockReturnValue(mockRedis as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationLocalGovernmentService,
        {
          provide: getRepositoryToken(ApplicationLocalGovernment),
          useValue: mockRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ApplicationLocalGovernmentService>(
      ApplicationLocalGovernmentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should load lgs into redis on init', async () => {
    expect(mockRedis.set).toHaveBeenCalledTimes(1);
    expect(mockRedis.set).toHaveBeenCalledWith(
      'localGovernments',
      JSON.stringify(mockLocalGovernments),
    );
  });

  it('should call repositories when listing', async () => {
    mockRepository.find.mockResolvedValue([]);

    await service.list();

    expect(mockRepository.find).toHaveBeenCalledTimes(2);
  });

  it('should call repository on getByUuId', async () => {
    const uuid = 'fake';
    mockRepository.findOne.mockResolvedValue({} as ApplicationLocalGovernment);

    await service.getByUuid(uuid);

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        uuid,
      },
      relations: {
        preferredRegion: true,
      },
    });
  });
});

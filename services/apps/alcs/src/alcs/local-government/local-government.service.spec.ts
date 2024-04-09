import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalGovernment } from './local-government.entity';
import { LocalGovernmentService } from './local-government.service';

describe('LocalGovernmentService', () => {
  let mockRepository: DeepMocked<Repository<LocalGovernment>>;

  let service: LocalGovernmentService;

  const mockLocalGovernments = [
    {
      name: 'lg-name',
      uuid: 'lg-uuid',
    } as any,
  ];

  beforeEach(async () => {
    mockRepository = createMock<Repository<LocalGovernment>>();
    mockRepository.find.mockResolvedValue(mockLocalGovernments);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalGovernmentService,
        {
          provide: getRepositoryToken(LocalGovernment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LocalGovernmentService>(LocalGovernmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repositories when listing', async () => {
    mockRepository.find.mockResolvedValue([]);

    await service.list();

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should call repositories when listActive', async () => {
    mockRepository.find.mockResolvedValue([]);

    await service.listActive();

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should call repositories when getByName', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await service.getByName('name');

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call repositories when getByBuid', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await service.getByGuid('name');

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call repository on getByUuId', async () => {
    const uuid = 'fake';
    mockRepository.findOneOrFail.mockResolvedValue(new LocalGovernment());

    await service.getByUuid(uuid);

    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
      where: {
        uuid,
      },
      relations: {
        preferredRegion: true,
      },
    });
  });

  it('should call repository on create', async () => {
    mockRepository.save.mockResolvedValue(new LocalGovernment());

    await service.create({
      name: 'name',
      bceidBusinessGuid: null,
      isFirstNation: false,
      isActive: true,
      preferredRegionCode: 'fake',
      emails: [],
    });

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should call repository on update', async () => {
    mockRepository.findOneOrFail.mockResolvedValue(new LocalGovernment());
    mockRepository.save.mockResolvedValue(new LocalGovernment());

    await service.update('', {
      name: 'name',
      bceidBusinessGuid: null,
      isFirstNation: false,
      isActive: true,
      preferredRegionCode: 'fake',
      emails: [],
    });

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should call repositories when fetching for search', async () => {
    mockRepository.findAndCount.mockResolvedValue([[], 0]);

    await service.fetch(0, 5, 'text');

    expect(mockRepository.findAndCount).toHaveBeenCalledTimes(1);
  });
});

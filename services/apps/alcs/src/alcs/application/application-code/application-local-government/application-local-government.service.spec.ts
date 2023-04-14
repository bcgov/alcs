import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationLocalGovernment } from './application-local-government.entity';
import { ApplicationLocalGovernmentService } from './application-local-government.service';

describe('ApplicationLocalGovernmentService', () => {
  let mockRepository: DeepMocked<Repository<ApplicationLocalGovernment>>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationLocalGovernmentService,
        {
          provide: getRepositoryToken(ApplicationLocalGovernment),
          useValue: mockRepository,
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

  it('should call repositories when listing', async () => {
    mockRepository.find.mockResolvedValue([]);

    await service.list();

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
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

  it('should call repository on create', async () => {
    mockRepository.save.mockResolvedValue({} as ApplicationLocalGovernment);

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
    mockRepository.findOneOrFail.mockResolvedValue(
      new ApplicationLocalGovernment(),
    );
    mockRepository.save.mockResolvedValue({} as ApplicationLocalGovernment);

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
});

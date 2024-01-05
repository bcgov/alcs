import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { Repository } from 'typeorm';
import {
  CONFIG_VALUE,
  Configuration,
} from '../../../common/entities/configuration.entity';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  let mockConfigRepo: DeepMocked<Repository<Configuration>>;

  beforeEach(async () => {
    mockConfigRepo = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ConfigurationService,
        {
          provide: getRepositoryToken(Configuration),
          useValue: mockConfigRepo,
        },
      ],
    }).compile();

    service = module.get<ConfigurationService>(ConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the repo for list', async () => {
    mockConfigRepo.find.mockResolvedValue([new Configuration({})]);

    const res = await service.list();

    expect(res.length).toEqual(1);
    expect(mockConfigRepo.find).toHaveBeenCalledTimes(1);
  });

  it('should call upsert for save', async () => {
    mockConfigRepo.upsert.mockResolvedValue({} as any);

    const res = await service.setConfigurationValue(
      CONFIG_VALUE.PORTAL_MAINTENANCE_MODE,
      'value',
    );

    expect(res).toBeDefined();
    expect(mockConfigRepo.upsert).toHaveBeenCalledTimes(1);
  });
});

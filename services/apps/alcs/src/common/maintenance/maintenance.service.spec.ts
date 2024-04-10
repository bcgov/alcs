import { DeepMocked, createMock } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceService } from './maintenance.service';
import { CONFIG_VALUE, Configuration } from '../entities/configuration.entity';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let mockRepo: DeepMocked<Repository<Configuration>>;

  beforeEach(async () => {
    mockRepo = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: getRepositoryToken(Configuration),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct banner info', async () => {
    const mockBanner = new Configuration({
      name: CONFIG_VALUE.APP_MAINTENANCE_BANNER,
      value: 'true',
    });

    const mockBannerMessage = new Configuration({
      name: CONFIG_VALUE.APP_MAINTENANCE_BANNER_MESSAGE,
      value: 'Test message',
    });

    mockRepo.findOne
      .mockReturnValueOnce(Promise.resolve(mockBanner))
      .mockReturnValueOnce(Promise.resolve(mockBannerMessage));

    const res = await service.getBanner();
    expect(mockRepo.findOne).toHaveBeenCalledTimes(2);
    expect(res).toEqual({
      showBanner: true,
      message: 'Test message',
    });
  });

  it('should return only banner status if the banner is not shown', async () => {
    const mockBanner = new Configuration({
      name: CONFIG_VALUE.APP_MAINTENANCE_BANNER,
      value: 'false',
    });

    mockRepo.findOne.mockResolvedValue(mockBanner);

    const res = await service.getBanner();
    expect(mockRepo.findOne).toHaveBeenCalledTimes(1);
    expect(res).toEqual({
      showBanner: false,
      message: null,
    });
  });
});

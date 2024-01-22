import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { CONFIG_VALUE } from '../../../common/entities/configuration.entity';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationController', () => {
  let controller: ConfigurationController;
  let mockConfigurationService: DeepMocked<ConfigurationService>;

  beforeEach(async () => {
    mockConfigurationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationController],
      providers: [
        {
          provide: ConfigurationService,
          useValue: mockConfigurationService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<ConfigurationController>(ConfigurationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for list', async () => {
    mockConfigurationService.list.mockResolvedValue([]);

    await controller.listConfigs();

    expect(mockConfigurationService.list).toHaveBeenCalledTimes(1);
  });

  it('should call through for a valid set config', async () => {
    mockConfigurationService.setConfigurationValue.mockResolvedValue({} as any);

    await controller.setConfiguration(CONFIG_VALUE.PORTAL_MAINTENANCE_MODE, {
      value: 'true',
    });

    expect(
      mockConfigurationService.setConfigurationValue,
    ).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception for an invalid config', async () => {
    const promise = controller.setConfiguration('BAD_VALUE', {
      value: 'true',
    });

    await expect(promise).rejects.toMatchObject(
      new BadRequestException('Unable to set config that is not programmed'),
    );

    expect(
      mockConfigurationService.setConfigurationValue,
    ).toHaveBeenCalledTimes(0);
  });
});

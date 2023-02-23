import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationLocalGovernmentService } from '../../application/application-code/application-local-government/application-local-government.service';
import { LocalGovernmentController } from './local-government.controller';

describe('LocalGovernmentController', () => {
  let controller: LocalGovernmentController;
  let mockLgService: DeepMocked<ApplicationLocalGovernmentService>;

  beforeEach(async () => {
    mockLgService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalGovernmentController],
      providers: [
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockLgService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<LocalGovernmentController>(
      LocalGovernmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching local governments', async () => {
    mockLgService.fetch.mockResolvedValue([[], 0]);

    const localGovernments = await controller.fetch(0, 1);

    expect(localGovernments).toBeDefined();
    expect(mockLgService.fetch).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when updating a government', async () => {
    mockLgService.update.mockResolvedValue();

    await controller.update('fake', {
      name: '',
      isFirstNation: false,
      bceidBusinessGuid: null,
      isActive: true,
    });

    expect(mockLgService.update).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating a government', async () => {
    mockLgService.create.mockResolvedValue();

    await controller.create({
      name: '',
      isFirstNation: false,
      bceidBusinessGuid: null,
      isActive: true,
    });

    expect(mockLgService.create).toHaveBeenCalledTimes(1);
  });
});

import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationRegion } from '../code/application-code/application-region/application-region.entity';
import { LocalGovernmentController } from './local-government.controller';
import { LocalGovernment } from './local-government.entity';
import { LocalGovernmentService } from './local-government.service';

describe('LocalGovernmentController', () => {
  let controller: LocalGovernmentController;
  let mockService: DeepMocked<LocalGovernmentService>;

  beforeEach(async () => {
    mockService = createMock<LocalGovernmentService>();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [LocalGovernmentController],
      providers: [
        {
          provide: LocalGovernmentService,
          useValue: mockService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<LocalGovernmentController>(
      LocalGovernmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for list', async () => {
    const mockGovernment = new LocalGovernment({
      name: 'Government',
      uuid: 'uuid',
      preferredRegion: {
        code: 'code',
        label: 'label',
      } as ApplicationRegion,
      isActive: true,
    });
    mockService.listActive.mockResolvedValue([mockGovernment]);
    const res = await mockService.listActive();

    expect(mockService.listActive).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].name).toEqual(mockGovernment.name);
  });

  it('should call through for list of all governments', async () => {
    const mockGovernment = new LocalGovernment({
      name: 'Government',
      uuid: 'uuid',
      preferredRegion: {
        code: 'code',
        label: 'label',
      } as ApplicationRegion,
      isActive: false,
    });
    mockService.list.mockResolvedValue([mockGovernment]);
    const res = await mockService.list();

    expect(mockService.list).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0].name).toEqual(mockGovernment.name);
  });
});

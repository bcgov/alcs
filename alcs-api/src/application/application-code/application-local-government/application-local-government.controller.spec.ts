import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../common/utils/test-helpers/mockTypes';
import { ApplicationLocalGovernmentController } from './application-local-government.controller';
import { ApplicationLocalGovernment } from './application-local-government.entity';
import { ApplicationLocalGovernmentService } from './application-local-government.service';

describe('ApplicationLocalGovernmentController', () => {
  let controller: ApplicationLocalGovernmentController;
  let mockService: DeepMocked<ApplicationLocalGovernmentService>;

  beforeEach(async () => {
    mockService = createMock<ApplicationLocalGovernmentService>();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationLocalGovernmentController],
      providers: [
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationLocalGovernmentController>(
      ApplicationLocalGovernmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through for list', async () => {
    const mockGovernment = {
      name: 'Government',
      uuid: 'uuid',
      preferredRegion: {
        code: 'code',
        label: 'label',
      },
    } as ApplicationLocalGovernment;
    mockService.list.mockResolvedValue([mockGovernment]);
    const res = await mockService.list();

    expect(mockService.list).toHaveBeenCalled();
    expect(res.length).toEqual(1);
    expect(res[0].name).toEqual(mockGovernment.name);
  });
});

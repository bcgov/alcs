import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { CommissionerProfile } from '../common/automapper/commissioner.automapper.profile';
import { initApplicationMockEntity } from '../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { CommissionerController } from './commissioner.controller';

describe('CommissionerController', () => {
  let controller: CommissionerController;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        CommissionerProfile,
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [CommissionerController],
    }).compile();

    controller = module.get<CommissionerController>(CommissionerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to application service for fetch', async () => {
    const fileNumber = 'fake-file';
    mockApplicationService.get.mockResolvedValue(
      initApplicationMockEntity(fileNumber),
    );
    mockApplicationService.mapToDtos.mockResolvedValue([]);

    await controller.get('fake-file');

    expect(mockApplicationService.get).toHaveBeenCalledTimes(1);
    expect(mockApplicationService.get.mock.calls[0][0]).toEqual(fileNumber);
  });

  it('should map to the dto correctly', async () => {
    const fileNumber = 'fake-file';
    const mockDto: ApplicationDto = {
      fileNumber,
      summary: 'fake-summary',
      applicant: 'fake-applicant',
      localGovernment: {
        uuid: '',
        name: 'goverment-name',
        preferredRegionCode: 'code',
      },
    } as any;
    mockApplicationService.get.mockResolvedValue(
      initApplicationMockEntity(fileNumber),
    );
    mockApplicationService.mapToDtos.mockResolvedValue([mockDto]);

    const mappedApp = await controller.get('fake-file');

    expect(mappedApp.localGovernment).toEqual(mockDto.localGovernment);
    expect('summary' in mappedApp).toBeFalsy();
    expect(mappedApp.fileNumber).toEqual(fileNumber);
  });
});

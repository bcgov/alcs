import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationParcelService } from '../../../portal/application-submission/application-parcel/application-parcel.service';
import { ApplicationParcelController } from './application-parcel.controller';

describe('ApplicationParcelController', () => {
  let controller: ApplicationParcelController;
  let mockParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    mockParcelService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [ApplicationParcelController],
      providers: [
        {
          provide: ApplicationParcelService,
          useValue: mockParcelService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationParcelController>(
      ApplicationParcelController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service for get', async () => {
    mockParcelService.fetchByApplicationFileId.mockResolvedValue([]);

    await controller.get('');
    expect(mockParcelService.fetchByApplicationFileId).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for update', async () => {
    mockParcelService.update.mockResolvedValue([]);

    await controller.update('12', {
      alrArea: 5,
    });
    expect(mockParcelService.update).toHaveBeenCalledTimes(1);
    expect(mockParcelService.update).toHaveBeenCalledWith([
      {
        uuid: '12',
        alrArea: 5,
      },
    ]);
  });
});

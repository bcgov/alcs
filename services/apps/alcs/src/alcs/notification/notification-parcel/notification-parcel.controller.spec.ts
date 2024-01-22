import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NotificationParcelService } from '../../../portal/notification-submission/notification-parcel/notification-parcel.service';
import { NotificationParcelController } from './notification-parcel.controller';

describe('NotificationParcelController', () => {
  let controller: NotificationParcelController;
  let mockParcelService: DeepMocked<NotificationParcelService>;

  beforeEach(async () => {
    mockParcelService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NotificationParcelController],
      providers: [
        {
          provide: NotificationParcelService,
          useValue: mockParcelService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NotificationParcelController>(
      NotificationParcelController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service for get', async () => {
    mockParcelService.fetchByFileId.mockResolvedValue([]);

    await controller.get('');
    expect(mockParcelService.fetchByFileId).toHaveBeenCalledTimes(1);
  });
});

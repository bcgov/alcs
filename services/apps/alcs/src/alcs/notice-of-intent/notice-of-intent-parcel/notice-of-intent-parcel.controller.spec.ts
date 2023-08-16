import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentParcelService } from '../../../portal/notice-of-intent-submission/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentParcelController } from './notice-of-intent-parcel.controller';

describe('NoticeOfIntentParcelController', () => {
  let controller: NoticeOfIntentParcelController;
  let mockParcelService: DeepMocked<NoticeOfIntentParcelService>;

  beforeEach(async () => {
    mockParcelService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentParcelController],
      providers: [
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockParcelService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentParcelController>(
      NoticeOfIntentParcelController,
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

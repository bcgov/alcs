import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationSubmissionStatusService } from '../../../alcs/application/application-submission-status/application-submission-status.service';
import { NotificationSubmissionStatusService } from '../../../alcs/notification/notification-submission-status/notification-submission-status.service';
import { PublicStatusController } from './public-status.controller';

describe('PublicStatusController', () => {
  let controller: PublicStatusController;
  let mockAppStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockNotiStatusService: DeepMocked<NotificationSubmissionStatusService>;

  beforeEach(async () => {
    mockAppStatusService = createMock();
    mockNotiStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockAppStatusService,
        },
        {
          provide: NotificationSubmissionStatusService,
          useValue: mockNotiStatusService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      controllers: [PublicStatusController],
    }).compile();

    controller = module.get<PublicStatusController>(PublicStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

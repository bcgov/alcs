import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationSubmissionStatusService } from '../../../alcs/application/application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../../../alcs/application/application-submission-status/submission-status-type.entity';
import { NotificationSubmissionStatusType } from '../../../alcs/notification/notification-submission-status/notification-status-type.entity';
import { NotificationSubmissionStatusService } from '../../../alcs/notification/notification-submission-status/notification-submission-status.service';
import { ApplicationSubmissionProfile } from '../../../common/automapper/application-submission.automapper.profile';
import { NotificationSubmissionProfile } from '../../../common/automapper/notification-submission.automapper.profile';
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
        ApplicationSubmissionProfile,
        NotificationSubmissionProfile,
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

  it('should be load and map application and noi statuses', async () => {
    mockAppStatusService.listStatuses.mockResolvedValue([
      new ApplicationSubmissionStatusType({
        code: 'ALCD',
      }),
    ]);
    mockNotiStatusService.listStatuses.mockResolvedValue([
      new NotificationSubmissionStatusType({
        code: 'ALCR',
      }),
    ]);

    const statuses = await controller.getStatuses();

    expect(statuses).toBeDefined();
    expect(statuses.length).toEqual(2);
    expect(mockAppStatusService.listStatuses).toHaveBeenCalledTimes(1);
    expect(mockNotiStatusService.listStatuses).toHaveBeenCalledTimes(1);
  });

  it('should filter out non public statuses', async () => {
    mockAppStatusService.listStatuses.mockResolvedValue([
      new ApplicationSubmissionStatusType({
        code: 'NOTR',
      }),
    ]);
    mockNotiStatusService.listStatuses.mockResolvedValue([
      new NotificationSubmissionStatusType({
        code: 'NOTR',
      }),
    ]);

    const statuses = await controller.getStatuses();

    expect(statuses).toBeDefined();
    expect(statuses.length).toEqual(0);
    expect(mockAppStatusService.listStatuses).toHaveBeenCalledTimes(1);
    expect(mockNotiStatusService.listStatuses).toHaveBeenCalledTimes(1);
  });
});

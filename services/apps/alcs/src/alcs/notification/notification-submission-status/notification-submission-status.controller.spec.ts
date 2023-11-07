import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NotificationSubmissionProfile } from '../../../common/automapper/notification-submission.automapper.profile';
import { NotificationSubmissionToSubmissionStatus } from './notification-status.entity';
import { NotificationSubmissionStatusController } from './notification-submission-status.controller';
import { NotificationSubmissionStatusService } from './notification-submission-status.service';

describe('NotificationSubmissionStatusController', () => {
  let controller: NotificationSubmissionStatusController;
  let mockNoticeOfIntentSubmissionStatusService: DeepMocked<NotificationSubmissionStatusService>;

  beforeEach(async () => {
    mockNoticeOfIntentSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationSubmissionStatusController],
      providers: [
        NotificationSubmissionProfile,
        {
          provide: NotificationSubmissionStatusService,
          useValue: mockNoticeOfIntentSubmissionStatusService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
    }).compile();

    controller = module.get<NotificationSubmissionStatusController>(
      NotificationSubmissionStatusController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to get statuses by file number', async () => {
    const fakeFileNumber = 'fake';

    mockNoticeOfIntentSubmissionStatusService.getCurrentStatusesByFileNumber.mockResolvedValue(
      [new NotificationSubmissionToSubmissionStatus()],
    );

    const result = await controller.getStatusesByFileNumber(fakeFileNumber);

    expect(
      mockNoticeOfIntentSubmissionStatusService.getCurrentStatusesByFileNumber,
    ).toBeCalledTimes(1);
    expect(
      mockNoticeOfIntentSubmissionStatusService.getCurrentStatusesByFileNumber,
    ).toBeCalledWith(fakeFileNumber);
    expect(result.length).toEqual(1);
    expect(result).toBeDefined();
  });

  it('should call service to get current submission status by file number', async () => {
    const fakeFileNumber = 'fake';

    mockNoticeOfIntentSubmissionStatusService.getCurrentStatusByFileNumber.mockResolvedValue(
      new NotificationSubmissionToSubmissionStatus(),
    );

    const result =
      await controller.getCurrentStatusByFileNumber(fakeFileNumber);

    expect(
      mockNoticeOfIntentSubmissionStatusService.getCurrentStatusByFileNumber,
    ).toBeCalledTimes(1);
    expect(
      mockNoticeOfIntentSubmissionStatusService.getCurrentStatusByFileNumber,
    ).toBeCalledWith(fakeFileNumber);
    expect(result).toBeDefined();
  });
});

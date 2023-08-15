import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { NoticeOfIntentSubmissionProfile } from '../../../common/automapper/notice-of-intent-submission.automapper.profile';
import { NoticeOfIntentSubmissionToSubmissionStatus } from './notice-of-intent-status.entity';
import { NoticeOfIntentSubmissionStatusController } from './notice-of-intent-submission-status.controller';
import { NoticeOfIntentSubmissionStatusService } from './notice-of-intent-submission-status.service';

describe('NoticeOfIntentSubmissionStatusController', () => {
  let controller: NoticeOfIntentSubmissionStatusController;
  let mockNoticeOfIntentSubmissionStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;

  beforeEach(async () => {
    mockNoticeOfIntentSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeOfIntentSubmissionStatusController],
      providers: [
        NoticeOfIntentSubmissionProfile,
        {
          provide: NoticeOfIntentSubmissionStatusService,
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

    controller = module.get<NoticeOfIntentSubmissionStatusController>(
      NoticeOfIntentSubmissionStatusController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service to get statuses by file number', async () => {
    const fakeFileNumber = 'fake';

    mockNoticeOfIntentSubmissionStatusService.getCurrentStatusesByFileNumber.mockResolvedValue(
      [new NoticeOfIntentSubmissionToSubmissionStatus()],
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
      new NoticeOfIntentSubmissionToSubmissionStatus(),
    );

    const result = await controller.getCurrentStatusByFileNumber(
      fakeFileNumber,
    );

    expect(
      mockNoticeOfIntentSubmissionStatusService.getCurrentStatusByFileNumber,
    ).toBeCalledTimes(1);
    expect(
      mockNoticeOfIntentSubmissionStatusService.getCurrentStatusByFileNumber,
    ).toBeCalledWith(fakeFileNumber);
    expect(result).toBeDefined();
  });
});

import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { TrackingService } from '../../common/tracking/tracking.service';
import { NoticeOfIntentOwner } from '../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentSubmission } from '../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { StatusEmailService } from '../../providers/email/status-email.service';
import { User } from '../../user/user.entity';
import { BoardService } from '../board/board.service';
import { NOI_SUBMISSION_STATUS } from './notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from './notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntentSubmissionStatusService } from './notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentController } from './notice-of-intent.controller';
import { NoticeOfIntent } from './notice-of-intent.entity';
import { NoticeOfIntentService } from './notice-of-intent.service';

describe('NoticeOfIntentController', () => {
  let controller: NoticeOfIntentController;
  let mockService: DeepMocked<NoticeOfIntentService>;
  let mockSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockBoardService: DeepMocked<BoardService>;
  let mockSubmissionStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;
  let mockStatusEmailService: DeepMocked<StatusEmailService>;
  let mockTrackingService: DeepMocked<TrackingService>;

  beforeEach(async () => {
    mockService = createMock();
    mockSubmissionService = createMock();
    mockBoardService = createMock();
    mockSubmissionStatusService = createMock();
    mockStatusEmailService = createMock();
    mockTrackingService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [NoticeOfIntentController],
      providers: [
        {
          provide: NoticeOfIntentService,
          useValue: mockService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockSubmissionService,
        },
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockSubmissionStatusService,
        },
        {
          provide: StatusEmailService,
          useValue: mockStatusEmailService,
        },
        {
          provide: TrackingService,
          useValue: mockTrackingService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<NoticeOfIntentController>(NoticeOfIntentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call through to service for get', async () => {
    mockTrackingService.trackView.mockResolvedValue();
    mockService.getByFileNumber.mockResolvedValue(new NoticeOfIntent());
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.get('fileNumber', {
      user: {
        entity: new User(),
      },
    });

    expect(mockService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
    expect(mockTrackingService.trackView).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for search', async () => {
    mockService.searchByFileNumber.mockResolvedValue([new NoticeOfIntent()]);
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.search('fileNumber');

    expect(mockService.searchByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for update', async () => {
    mockService.update.mockResolvedValue(new NoticeOfIntent());
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.update({}, 'fileNumber');

    expect(mockService.update).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for get card', async () => {
    mockService.getByCardUuid.mockResolvedValue(new NoticeOfIntent());
    mockService.mapToDtos.mockResolvedValue([]);

    await controller.getByCard('uuid');

    expect(mockService.getByCardUuid).toHaveBeenCalledTimes(1);
    expect(mockService.mapToDtos).toHaveBeenCalledTimes(1);
  });

  it('should call through to service for get sub types', async () => {
    mockService.listSubtypes.mockResolvedValue([]);

    await controller.getSubtypes();

    expect(mockService.listSubtypes).toHaveBeenCalledTimes(1);
  });

  it('should call through to submission service for cancel', async () => {
    mockSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      {} as any,
    );
    mockSubmissionService.get.mockResolvedValue(
      new NoticeOfIntentSubmission({
        status: new NoticeOfIntentSubmissionToSubmissionStatus({
          statusTypeCode: NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC,
        }),
      }),
    );
    mockStatusEmailService.getNoticeOfIntentEmailData.mockResolvedValue({
      primaryContact: new NoticeOfIntentOwner(),
    } as any);
    mockStatusEmailService.sendNoticeOfIntentStatusEmail.mockResolvedValue();

    await controller.cancel('file-number', true);

    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledWith('file-number', NOI_SUBMISSION_STATUS.CANCELLED);
    expect(
      mockStatusEmailService.getNoticeOfIntentEmailData,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendNoticeOfIntentStatusEmail,
    ).toHaveBeenCalledTimes(1);
  });

  it('should not send an email when cancelling in progress NOI', async () => {
    mockSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      {} as any,
    );
    mockSubmissionService.get.mockResolvedValue(
      new NoticeOfIntentSubmission({
        status: new NoticeOfIntentSubmissionToSubmissionStatus({
          statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
        }),
      }),
    );
    mockStatusEmailService.getNoticeOfIntentEmailData.mockResolvedValue({
      primaryContact: new NoticeOfIntentOwner(),
    } as any);
    mockStatusEmailService.sendNoticeOfIntentStatusEmail.mockResolvedValue();

    await controller.cancel('file-number', true);

    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledWith('file-number', NOI_SUBMISSION_STATUS.CANCELLED);
    expect(
      mockStatusEmailService.getNoticeOfIntentEmailData,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendNoticeOfIntentStatusEmail,
    ).toHaveBeenCalledTimes(0);
  });

  it('should call through to submission service for uncancel', async () => {
    mockSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      {} as any,
    );

    await controller.uncancel('file-number');

    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSubmissionStatusService.setStatusDateByFileNumber,
    ).toHaveBeenCalledWith(
      'file-number',
      NOI_SUBMISSION_STATUS.CANCELLED,
      null,
    );
  });
});

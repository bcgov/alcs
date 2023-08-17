import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionStatusType } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NOI_SUBMISSION_STATUS } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentSubmissionProfile } from '../../common/automapper/notice-of-intent-submission.automapper.profile';
import { User } from '../../user/user.entity';
import {
  NoticeOfIntentSubmissionValidatorService,
  ValidatedNoticeOfIntentSubmission,
} from './notice-of-intent-submission-validator.service';
import { NoticeOfIntentSubmissionController } from './notice-of-intent-submission.controller';
import {
  NoticeOfIntentSubmissionDetailedDto,
  NoticeOfIntentSubmissionDto,
} from './notice-of-intent-submission.dto';
import { NoticeOfIntentSubmission } from './notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

describe('NoticeOfIntentSubmissionController', () => {
  let controller: NoticeOfIntentSubmissionController;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockDocumentService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockLgService: DeepMocked<LocalGovernmentService>;
  let mockNoiValidatorService: DeepMocked<NoticeOfIntentSubmissionValidatorService>;

  const localGovernmentUuid = 'local-government';
  const applicant = 'fake-applicant';
  const bceidBusinessGuid = 'business-guid';

  beforeEach(async () => {
    mockNoiSubmissionService = createMock();
    mockDocumentService = createMock();
    mockLgService = createMock();
    mockNoiValidatorService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoticeOfIntentSubmissionController],
      providers: [
        NoticeOfIntentSubmissionProfile,
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLgService,
        },
        {
          provide: NoticeOfIntentSubmissionValidatorService,
          useValue: mockNoiValidatorService,
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

    controller = module.get<NoticeOfIntentSubmissionController>(
      NoticeOfIntentSubmissionController,
    );

    mockNoiSubmissionService.update.mockResolvedValue(
      new NoticeOfIntentSubmission({
        applicant: applicant,
        localGovernmentUuid,
      }),
    );

    mockNoiSubmissionService.create.mockResolvedValue('2');
    mockNoiSubmissionService.getByFileNumber.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );
    mockNoiSubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );

    mockNoiSubmissionService.mapToDTOs.mockResolvedValue([]);
    mockLgService.list.mockResolvedValue([
      new LocalGovernment({
        uuid: localGovernmentUuid,
        bceidBusinessGuid,
        name: 'fake-name',
        isFirstNation: false,
      }),
    ]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching notice of intents', async () => {
    mockNoiSubmissionService.getAllByUser.mockResolvedValue([]);

    const submissions = await controller.getSubmissions({
      user: {
        entity: new User(),
      },
    });

    expect(submissions).toBeDefined();
    expect(mockNoiSubmissionService.getAllByUser).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when cancelling an notice of intent', async () => {
    const mockApplication = new NoticeOfIntentSubmission({
      status: new NoticeOfIntentSubmissionToSubmissionStatus({
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      }),
    });

    mockNoiSubmissionService.mapToDTOs.mockResolvedValue([
      {} as NoticeOfIntentSubmissionDto,
    ]);
    mockNoiSubmissionService.getByUuid.mockResolvedValue(mockApplication);
    mockNoiSubmissionService.cancel.mockResolvedValue(
      new NoticeOfIntentSubmissionToSubmissionStatus(),
    );

    const noticeOfIntentSubmission = await controller.cancel('file-id', {
      user: {
        entity: new User(),
      },
    });

    expect(noticeOfIntentSubmission).toBeDefined();
    expect(mockNoiSubmissionService.cancel).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledWith(
      'file-id',
      new User(),
    );
  });

  it('should throw an exception when trying to cancel a notice of intent that is not in progress', async () => {
    const mockNoi = new NoticeOfIntentSubmission();
    mockNoiSubmissionService.getByUuid.mockResolvedValue({
      ...mockNoi,
      status: new NoticeOfIntentSubmissionStatusType({
        code: NOI_SUBMISSION_STATUS.CANCELLED,
      }),
    } as any);
    mockNoiSubmissionService.cancel.mockResolvedValue(
      new NoticeOfIntentSubmissionToSubmissionStatus(),
    );

    const promise = controller.cancel('file-id', {
      user: {
        entity: new User(),
      },
    });

    await expect(promise).rejects.toMatchObject(
      new BadRequestException('Can only cancel in progress Notice of Intents'),
    );
    expect(mockNoiSubmissionService.cancel).toHaveBeenCalledTimes(0);
    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledWith(
      'file-id',
      new User(),
    );
  });

  it('should call out to service when fetching a notice of intent', async () => {
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NoticeOfIntentSubmissionDetailedDto,
    );

    const noticeOfIntent = controller.getSubmission(
      {
        user: {
          entity: new User(),
        },
      },
      '',
    );

    expect(noticeOfIntent).toBeDefined();
    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledTimes(1);
  });

  it('should fetch notice of intent by bceid if user has same guid as a local government', async () => {
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NoticeOfIntentSubmissionDetailedDto,
    );
    mockNoiSubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission({
        localGovernmentUuid: '',
      }),
    );

    const noiSubmission = controller.getSubmission(
      {
        user: {
          entity: new User({
            bceidBusinessGuid: 'guid',
          }),
        },
      },
      '',
    );

    expect(noiSubmission).toBeDefined();
    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating an notice of intent', async () => {
    mockNoiSubmissionService.create.mockResolvedValue('');
    mockNoiSubmissionService.mapToDTOs.mockResolvedValue([
      {} as NoticeOfIntentSubmissionDto,
    ]);

    const noiSubmission = await controller.create(
      {
        user: {
          entity: new User(),
        },
      },
      {
        type: '',
      },
    );

    expect(noiSubmission).toBeDefined();
    expect(mockNoiSubmissionService.create).toHaveBeenCalledTimes(1);
  });

  it('should call out to service for update and map', async () => {
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NoticeOfIntentSubmissionDetailedDto,
    );
    mockNoiSubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission({
        status: new NoticeOfIntentSubmissionToSubmissionStatus({
          statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
        }),
      }),
    );

    await controller.update(
      'file-id',
      {
        localGovernmentUuid,
        applicant,
      },
      {
        user: {
          entity: new User(),
        },
      },
    );

    expect(mockNoiSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when trying to update a not in progress noi', async () => {
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NoticeOfIntentSubmissionDetailedDto,
    );
    mockNoiSubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission({
        status: new NoticeOfIntentSubmissionToSubmissionStatus({
          statusTypeCode: NOI_SUBMISSION_STATUS.CANCELLED,
        }),
      }),
    );

    const promise = controller.update(
      'file-id',
      {
        localGovernmentUuid,
        applicant,
      },
      {
        user: {
          entity: new User(),
        },
      },
    );
    await expect(promise).rejects.toMatchObject(
      new BadRequestException('Can only edit in progress Notice of Intents'),
    );

    expect(mockNoiSubmissionService.update).toHaveBeenCalledTimes(0);
    expect(mockNoiSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(0);
  });

  it('should call out to service on submitAlcs', async () => {
    const mockFileId = 'file-id';
    mockNoiSubmissionService.submitToAlcs.mockResolvedValue(
      new NoticeOfIntent(),
    );
    mockNoiSubmissionService.getByUuid.mockResolvedValue(
      new NoticeOfIntentSubmission(),
    );
    mockNoiValidatorService.validateSubmission.mockResolvedValue({
      noticeOfIntentSubmission:
        new NoticeOfIntentSubmission() as ValidatedNoticeOfIntentSubmission,
      errors: [],
    });
    mockNoiSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NoticeOfIntentSubmissionDetailedDto,
    );

    await controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    expect(mockNoiSubmissionService.getByUuid).toHaveBeenCalledTimes(2);
    expect(mockNoiSubmissionService.submitToAlcs).toHaveBeenCalledTimes(1);
    expect(mockNoiValidatorService.validateSubmission).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
  });
});

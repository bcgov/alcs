import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NotificationDocument } from '../../alcs/notification/notification-document/notification-document.entity';
import { NOTIFICATION_STATUS } from '../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationSubmissionToSubmissionStatus } from '../../alcs/notification/notification-submission-status/notification-status.entity';
import { Notification } from '../../alcs/notification/notification.entity';
import { NotificationSubmissionProfile } from '../../common/automapper/notification-submission.automapper.profile';
import { User } from '../../user/user.entity';
import { GenerateSrwDocumentService } from '../pdf-generation/generate-srw-document.service';
import {
  NotificationSubmissionValidatorService,
  ValidatedNotificationSubmission,
} from './notification-submission-validator.service';
import { NotificationSubmissionController } from './notification-submission.controller';
import {
  NotificationSubmissionDetailedDto,
  NotificationSubmissionDto,
} from './notification-submission.dto';
import { NotificationSubmission } from './notification-submission.entity';
import { NotificationSubmissionService } from './notification-submission.service';
import { NotificationTransferee } from './notification-transferee/notification-transferee.entity';

describe('NotificationSubmissionController', () => {
  let controller: NotificationSubmissionController;
  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockNotificationValidationService: DeepMocked<NotificationSubmissionValidatorService>;
  let mockSrwDocumentService: DeepMocked<GenerateSrwDocumentService>;

  const primaryContactOwnerUuid = 'primary-contact';
  const localGovernmentUuid = 'local-government';
  const applicant = 'fake-applicant';
  const bceidBusinessGuid = 'business-guid';

  beforeEach(async () => {
    mockNotificationSubmissionService = createMock();
    mockNotificationValidationService = createMock();
    mockSrwDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationSubmissionController],
      providers: [
        NotificationSubmissionProfile,
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
        },
        {
          provide: NotificationSubmissionValidatorService,
          useValue: mockNotificationValidationService,
        },
        {
          provide: GenerateSrwDocumentService,
          useValue: mockSrwDocumentService,
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

    controller = module.get<NotificationSubmissionController>(
      NotificationSubmissionController,
    );

    mockNotificationSubmissionService.update.mockResolvedValue(
      new NotificationSubmission({
        applicant: applicant,
        localGovernmentUuid,
      }),
    );

    mockNotificationSubmissionService.create.mockResolvedValue('2');
    mockNotificationSubmissionService.getByFileNumber.mockResolvedValue(
      new NotificationSubmission(),
    );
    mockNotificationSubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission(),
    );

    mockNotificationSubmissionService.mapToDTOs.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching notice of intents', async () => {
    mockNotificationSubmissionService.getAllByUser.mockResolvedValue([]);

    const submissions = await controller.getSubmissions({
      user: {
        entity: new User(),
      },
    });

    expect(submissions).toBeDefined();
    expect(
      mockNotificationSubmissionService.getAllByUser,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when fetching a notice of intent', async () => {
    mockNotificationSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NotificationSubmissionDetailedDto,
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
    expect(mockNotificationSubmissionService.getByUuid).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should fetch notice of intent by bceid if user has same guid as a local government', async () => {
    mockNotificationSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NotificationSubmissionDetailedDto,
    );
    mockNotificationSubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission({
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
    expect(mockNotificationSubmissionService.getByUuid).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call out to service when creating an notice of intent', async () => {
    mockNotificationSubmissionService.create.mockResolvedValue('');
    mockNotificationSubmissionService.mapToDTOs.mockResolvedValue([
      {} as NotificationSubmissionDto,
    ]);

    const noiSubmission = await controller.create({
      user: {
        entity: new User(),
      },
    });

    expect(noiSubmission).toBeDefined();
    expect(mockNotificationSubmissionService.create).toHaveBeenCalledTimes(1);
  });

  it('should call out to service for update and map', async () => {
    mockNotificationSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NotificationSubmissionDetailedDto,
    );
    mockNotificationSubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission({
        status: new NotificationSubmissionToSubmissionStatus({
          statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
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
          entity: new User({
            clientRoles: [],
          }),
        },
      },
    );

    expect(mockNotificationSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(
      mockNotificationSubmissionService.mapToDetailedDTO,
    ).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when trying to update a not in progress notification', async () => {
    mockNotificationSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NotificationSubmissionDetailedDto,
    );
    mockNotificationSubmissionService.getByUuid.mockResolvedValue(
      new NotificationSubmission({
        status: new NotificationSubmissionToSubmissionStatus({
          statusTypeCode: NOTIFICATION_STATUS.CANCELLED,
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
          entity: new User({
            clientRoles: [],
          }),
        },
      },
    );
    await expect(promise).rejects.toMatchObject(
      new BadRequestException('Can only edit in progress SRWs'),
    );

    expect(mockNotificationSubmissionService.update).toHaveBeenCalledTimes(0);
    expect(
      mockNotificationSubmissionService.mapToDetailedDTO,
    ).toHaveBeenCalledTimes(0);
  });

  it('should call out to service on submitAlcs', async () => {
    const mockFileId = 'file-id';
    const mockOwner = new NotificationTransferee({
      uuid: primaryContactOwnerUuid,
    });
    const mockSubmission = new NotificationSubmission({
      fileNumber: mockFileId,
      transferees: [mockOwner],
      localGovernmentUuid,
    });

    mockNotificationSubmissionService.sendAndRecordLTSAPackage.mockResolvedValue(
      {} as any,
    );
    mockNotificationSubmissionService.submitToAlcs.mockResolvedValue(
      new Notification(),
    );
    mockNotificationSubmissionService.getByUuid.mockResolvedValue(
      mockSubmission,
    );
    mockNotificationSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as NotificationSubmissionDetailedDto,
    );
    mockNotificationValidationService.validateSubmission.mockResolvedValue({
      noticeOfIntentSubmission:
        mockSubmission as ValidatedNotificationSubmission,
      errors: [],
    });
    mockSrwDocumentService.generateAndAttach.mockResolvedValue(
      new NotificationDocument(),
    );

    await controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    expect(mockNotificationSubmissionService.getByUuid).toHaveBeenCalledTimes(
      2,
    );
    expect(
      mockNotificationSubmissionService.submitToAlcs,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockNotificationSubmissionService.mapToDetailedDTO,
    ).toHaveBeenCalledTimes(1);
    expect(mockSrwDocumentService.generateAndAttach).toHaveBeenCalledTimes(1);
    expect(
      mockNotificationSubmissionService.sendAndRecordLTSAPackage,
    ).toHaveBeenCalledTimes(1);
  });
});

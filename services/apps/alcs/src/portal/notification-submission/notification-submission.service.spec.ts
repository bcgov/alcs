import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { VISIBILITY_FLAG } from '../../alcs/application/application-document/application-document.entity';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentType } from '../../alcs/notice-of-intent/notice-of-intent-type/notice-of-intent-type.entity';
import { NotificationDocument } from '../../alcs/notification/notification-document/notification-document.entity';
import { NotificationDocumentService } from '../../alcs/notification/notification-document/notification-document.service';
import { NOTIFICATION_STATUS } from '../../alcs/notification/notification-submission-status/notification-status.dto';
import { NotificationSubmissionToSubmissionStatus } from '../../alcs/notification/notification-submission-status/notification-status.entity';
import { NotificationSubmissionStatusService } from '../../alcs/notification/notification-submission-status/notification-submission-status.service';
import { Notification } from '../../alcs/notification/notification.entity';
import { NotificationService } from '../../alcs/notification/notification.service';
import { NotificationSubmissionProfile } from '../../common/automapper/notification-submission.automapper.profile';
import { Document } from '../../document/document.entity';
import { FileNumberService } from '../../file-number/file-number.service';
import { EmailService } from '../../providers/email/email.service';
import { User } from '../../user/user.entity';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ValidatedNotificationSubmission } from './notification-submission-validator.service';
import { NotificationSubmission } from './notification-submission.entity';
import { NotificationSubmissionService } from './notification-submission.service';

describe('NotificationSubmissionService', () => {
  let service: NotificationSubmissionService;
  let mockRepository: DeepMocked<Repository<NotificationSubmission>>;
  let mockNotificationService: DeepMocked<NotificationService>;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockFileNumberService: DeepMocked<FileNumberService>;
  let mockStatusService: DeepMocked<NotificationSubmissionStatusService>;
  let mockDocumentService: DeepMocked<NotificationDocumentService>;
  let mockEmailService: DeepMocked<EmailService>;
  let mockSubmission;
  let mockQueryBuilder;

  beforeEach(async () => {
    mockRepository = createMock();
    mockNotificationService = createMock();
    mockLGService = createMock();
    mockFileNumberService = createMock();
    mockStatusService = createMock();
    mockEmailService = createMock();
    mockDocumentService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NotificationSubmissionService,
        NotificationSubmissionProfile,
        {
          provide: getRepositoryToken(NotificationSubmission),
          useValue: mockRepository,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: FileNumberService,
          useValue: mockFileNumberService,
        },
        {
          provide: NotificationSubmissionStatusService,
          useValue: mockStatusService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: NotificationDocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    service = module.get<NotificationSubmissionService>(
      NotificationSubmissionService,
    );

    mockSubmission = new NotificationSubmission({
      fileNumber: 'file-number',
      applicant: 'incognito',
      typeCode: 'fake',
      localGovernmentUuid: 'uuid',
      createdBy: new User({
        clientRoles: [],
      }),
    });

    mockQueryBuilder = createMock<SelectQueryBuilder<ApplicationSubmission>>();
    mockQueryBuilder.leftJoin.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.execute.mockResolvedValue([
      {
        user_uuid: 'user_uuid',
        bceid_business_guid: 'bceid_business_guid',
        localGovernment_bceid_business_guid:
          'localGovernment_bceid_business_guid',
      },
    ]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched notification', async () => {
    const notificationSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(notificationSubmission);

    const app = await service.getByFileNumber(
      '',
      new User({
        clientRoles: [],
      }),
    );
    expect(app).toBe(notificationSubmission);
  });

  it('should return the fetched notification when fetching with user', async () => {
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const app = await service.getByFileNumber(
      '',
      new User({
        clientRoles: [],
      }),
    );
    expect(app).toBe(noiSubmission);
  });

  it('save a new noi for create', async () => {
    const fileId = 'file-id';
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.save.mockResolvedValue(new NotificationSubmission());
    mockFileNumberService.generateNextFileNumber.mockResolvedValue(fileId);
    mockNotificationService.create.mockResolvedValue(new Notification());
    mockStatusService.setInitialStatuses.mockResolvedValue([]);

    const fileNumber = await service.create(
      'type',
      new User({
        clientRoles: [],
      }),
    );

    expect(fileNumber).toEqual(fileId);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.create).toHaveBeenCalledTimes(1);
    expect(mockStatusService.setInitialStatuses).toHaveBeenCalledTimes(1);
  });

  it('should call through for get by user', async () => {
    const noiSubmission = new NotificationSubmission();
    mockRepository.find.mockResolvedValue([noiSubmission]);

    const res = await service.getAllByUser(
      new User({
        clientRoles: [],
      }),
    );
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0]).toBe(noiSubmission);
  });

  it('should call through for getByFileId', async () => {
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.getByFileNumber(
      '',
      new User({
        clientRoles: [],
      }),
    );
    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(res).toBe(noiSubmission);
  });

  it('should use notification type service for mapping DTOs', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';

    mockNotificationService.listTypes.mockResolvedValue([
      new NoticeOfIntentType({
        code: typeCode,
        portalLabel: 'portalLabel',
        htmlDescription: 'htmlDescription',
        label: 'label',
      }),
    ]);

    const noiSubmission = new NotificationSubmission({
      applicant,
      typeCode: typeCode,
      auditCreatedAt: new Date(),
      createdBy: new User(),
      submissionStatuses: [],
      status: new NotificationSubmissionToSubmissionStatus(),
    });
    mockRepository.findOne.mockResolvedValue(noiSubmission);

    const res = await service.mapToDTOs(
      [noiSubmission],
      new User({
        clientRoles: [],
      }),
    );
    expect(mockNotificationService.listTypes).toHaveBeenCalledTimes(1);
    expect(res[0].type).toEqual('label');
    expect(res[0].applicant).toEqual(applicant);
  });

  it('should fail on submitToAlcs if validation fails', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';
    const noticeOfIntentSubmission = new NotificationSubmission({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
    });

    mockNotificationService.submit.mockRejectedValue(new Error());

    await expect(
      service.submitToAlcs(
        noticeOfIntentSubmission as ValidatedNotificationSubmission,
      ),
    ).rejects.toMatchObject(
      new BaseServiceException(`Failed to submit notification: ${fileNumber}`),
    );
  });

  it('should call out to service on submitToAlcs', async () => {
    const notification = new Notification({
      dateSubmittedToAlc: new Date(),
    });
    mockStatusService.setStatusDate.mockResolvedValue(
      new NotificationSubmissionToSubmissionStatus(),
    );

    mockNotificationService.submit.mockResolvedValue(notification);
    await service.submitToAlcs(mockSubmission);

    expect(mockNotificationService.submit).toBeCalledTimes(1);
    expect(mockStatusService.setStatusDate).toHaveBeenCalledTimes(1);
  });

  it('should update fields if notification exists', async () => {
    const applicant = 'Bruce Wayne';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';

    mockRepository.findOneOrFail.mockResolvedValue(mockSubmission);
    mockRepository.save.mockResolvedValue(mockSubmission);
    mockNotificationService.update.mockResolvedValue(new Notification());

    const result = await service.update(
      fileNumber,
      {
        applicant,
        localGovernmentUuid,
      },
      new User({
        clientRoles: [],
      }),
    );

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(2);
  });

  it('should return the fetched notification when fetching with file number', async () => {
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const app = await service.getOrFailByFileNumber('');

    expect(app).toBe(noiSubmission);
  });

  it('should call through to the repo for getFileNumber', async () => {
    const fileNumber = 'file-number';
    const noiSubmission = new NotificationSubmission({
      fileNumber,
    });
    mockRepository.findOne.mockResolvedValue(noiSubmission);

    const res = await service.getFileNumber('uuid');

    expect(res).toBe(fileNumber);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should call through to the repo for getUuid', async () => {
    const uuid = 'uuid';
    const noiSubmission = new NotificationSubmission({
      uuid,
    });
    mockRepository.findOne.mockResolvedValue(noiSubmission);

    const res = await service.getUuid('file-number');

    expect(res).toBe(uuid);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should change the status when sending the email was successfull', async () => {
    const uuid = 'uuid';
    const noiSubmission = new NotificationSubmission({
      uuid,
      localGovernmentUuid: 'uuid',
      contactEmail: 'contact@contact',
    });
    const document = new NotificationDocument({
      document: new Document(),
    });

    mockLGService.getByUuid.mockResolvedValue(
      new LocalGovernment({
        emails: ['gov@gov'],
      }),
    );
    mockNotificationService.getByFileNumber.mockResolvedValue(
      new Notification(),
    );
    mockEmailService.sendEmail.mockResolvedValue(true);
    mockDocumentService.attachDocumentAsBuffer.mockResolvedValue(
      new NotificationDocument(),
    );
    mockStatusService.setStatusDate.mockResolvedValue(
      new NotificationSubmissionToSubmissionStatus(),
    );

    await service.sendAndRecordLTSAPackage(noiSubmission, document, new User());

    expect(mockLGService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['contact@contact'],
        cc: ['gov@gov'],
      }),
    );

    expect(mockDocumentService.attachDocumentAsBuffer).toHaveBeenCalledTimes(1);
    expect(mockStatusService.setStatusDate).toHaveBeenCalledTimes(1);
    expect(mockStatusService.setStatusDate).toHaveBeenCalledWith(
      uuid,
      NOTIFICATION_STATUS.ALC_RESPONSE_SENT,
      undefined,
    );
  });

  it('should not change the status if the email fails', async () => {
    const uuid = 'uuid';
    const noiSubmission = new NotificationSubmission({
      uuid,
      localGovernmentUuid: 'uuid',
      contactEmail: 'contact@contact',
    });
    const document = new NotificationDocument({
      document: new Document(),
    });

    mockLGService.getByUuid.mockResolvedValue(
      new LocalGovernment({
        emails: ['gov@gov'],
      }),
    );
    mockNotificationService.getByFileNumber.mockResolvedValue(
      new Notification(),
    );
    mockEmailService.sendEmail.mockResolvedValue(false);

    await service.sendAndRecordLTSAPackage(noiSubmission, document, new User());

    expect(mockLGService.getByUuid).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['contact@contact'],
        cc: ['gov@gov'],
      }),
    );

    expect(mockDocumentService.attachDocumentAsBuffer).toHaveBeenCalledTimes(0);
    expect(mockStatusService.setStatusDate).toHaveBeenCalledTimes(0);
  });

  it('should return true for access document if its public', async () => {
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new NotificationDocument({
        visibilityFlags: [VISIBILITY_FLAG.PUBLIC],
      }),
      new User(),
    );

    expect(res).toBe(true);
  });

  it('should return true for access document if its applicant and requesting user owns it', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new NotificationDocument({
        visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
      }),
      new User({
        uuid: 'user_uuid',
      }),
    );

    expect(res).toBe(true);
  });

  it('should return false for access document if its applicant and requesting user does not own it', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new NotificationDocument({
        visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
      }),
      new User({
        uuid: 'NOT_user_uuid',
      }),
    );

    expect(res).toBe(false);
  });

  it('should return true for access document if its government and requesting user is in that government', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new NotificationDocument({
        visibilityFlags: [VISIBILITY_FLAG.GOVERNMENT],
      }),
      new User({
        bceidBusinessGuid: 'localGovernment_bceid_business_guid',
      }),
    );

    expect(res).toBe(true);
  });

  it('should return false for access document if its government and requesting user is NOT in that government', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new NotificationDocument({
        visibilityFlags: [VISIBILITY_FLAG.GOVERNMENT],
      }),
      new User({
        bceidBusinessGuid: 'NOT_localGovernment_bceid_business_guid',
      }),
    );

    expect(res).toBe(false);
  });

  it('should return true for access document if its applicant and requesting user is in same business', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new NotificationDocument({
        visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
      }),
      new User({
        bceidBusinessGuid: 'bceid_business_guid',
      }),
    );

    expect(res).toBe(true);
  });

  it('should return false for access document if its applicant and requesting user is NOT in same business account', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new NotificationDocument({
        visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
      }),
      new User({
        bceidBusinessGuid: 'NOT_bceid_business_guid',
      }),
    );

    expect(res).toBe(false);
  });

  it('should return true for delete document if user is owner', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canDeleteDocument(
      new NotificationDocument({}),
      new User({
        uuid: 'user_uuid',
      }),
    );

    expect(res).toBe(true);
  });

  it('should return false for delete document if user is NOT owner', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new NotificationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canDeleteDocument(
      new NotificationDocument({}),
      new User({
        uuid: 'NOT_user_uuid',
      }),
    );

    expect(res).toBe(false);
  });
});

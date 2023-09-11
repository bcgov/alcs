import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSubmissionProfile } from '../../../common/automapper/notification-submission.automapper.profile';
import { NotificationTransfereeProfile } from '../../../common/automapper/notification-transferee.automapper.profile';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';
import { NotificationTransferee } from '../../../portal/notification-submission/notification-transferee/notification-transferee.entity';
import { NotificationSubmissionStatusType } from '../notification-submission-status/notification-status-type.entity';
import { NOTIFICATION_STATUS } from '../notification-submission-status/notification-status.dto';
import { NotificationSubmissionStatusService } from '../notification-submission-status/notification-submission-status.service';
import { NotificationSubmissionService } from './notification-submission.service';

describe('NotificationSubmissionService', () => {
  let service: NotificationSubmissionService;

  let mockNotificationSubmissionRepo: DeepMocked<
    Repository<NotificationSubmission>
  >;
  let mockNotificationSubmissionStatusRepo: DeepMocked<
    Repository<NotificationSubmissionStatusType>
  >;
  let mockNotificationSubmissionStatusService: DeepMocked<NotificationSubmissionStatusService>;

  beforeEach(async () => {
    mockNotificationSubmissionRepo = createMock();
    mockNotificationSubmissionStatusRepo = createMock();
    mockNotificationSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NotificationSubmissionService,
        NotificationSubmissionProfile,
        NotificationTransfereeProfile,
        {
          provide: getRepositoryToken(NotificationSubmission),
          useValue: mockNotificationSubmissionRepo,
        },
        {
          provide: getRepositoryToken(NotificationSubmissionStatusType),
          useValue: mockNotificationSubmissionStatusRepo,
        },
        {
          provide: NotificationSubmissionStatusService,
          useValue: mockNotificationSubmissionStatusService,
        },
      ],
    }).compile();

    mockNotificationSubmissionStatusService.setStatusDate.mockResolvedValue(
      {} as any,
    );

    service = module.get<NotificationSubmissionService>(
      NotificationSubmissionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully find NotificationSubmission', async () => {
    const fakeFileNumber = 'fake';

    mockNotificationSubmissionRepo.findOneOrFail.mockResolvedValue(
      new NotificationSubmission(),
    );

    const result = await service.get(fakeFileNumber);

    expect(result).toBeDefined();
    expect(mockNotificationSubmissionRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockNotificationSubmissionRepo.findOneOrFail).toBeCalledWith({
      where: { fileNumber: fakeFileNumber },
      relations: {
        notification: {
          documents: {
            document: true,
          },
        },
        transferees: {
          type: true,
        },
      },
    });
  });

  it('should properly map to dto', async () => {
    const fakeSubmission = createMock<NotificationSubmission>({
      auditCreatedAt: new Date(),
      auditUpdatedAt: new Date(),
    });
    fakeSubmission.transferees = [
      new NotificationTransferee({
        uuid: 'uuid',
      }),
    ];

    const result = await service.mapToDto(fakeSubmission);

    expect(result).toBeDefined();
    expect(result.transferees.length).toEqual(1);
  });

  it('should successfully retrieve status from repo', async () => {
    mockNotificationSubmissionStatusRepo.findOneOrFail.mockResolvedValue(
      new NotificationSubmissionStatusType(),
    );

    const result = await service.getStatus(
      NOTIFICATION_STATUS.ALC_RESPONSE_SENT,
    );

    expect(result).toBeDefined();
    expect(mockNotificationSubmissionStatusRepo.findOneOrFail).toBeCalledTimes(
      1,
    );
    expect(mockNotificationSubmissionStatusRepo.findOneOrFail).toBeCalledWith({
      where: { code: NOTIFICATION_STATUS.ALC_RESPONSE_SENT },
    });
  });

  it('should successfully update the status', async () => {
    mockNotificationSubmissionStatusRepo.findOneOrFail.mockResolvedValue(
      new NotificationSubmissionStatusType(),
    );
    mockNotificationSubmissionRepo.findOneOrFail.mockResolvedValue(
      new NotificationSubmission({
        uuid: 'fake',
      }),
    );

    await service.updateStatus('fake', NOTIFICATION_STATUS.ALC_RESPONSE_SENT);

    expect(mockNotificationSubmissionRepo.findOneOrFail).toBeCalledTimes(1);
    expect(mockNotificationSubmissionRepo.findOneOrFail).toBeCalledWith({
      where: {
        fileNumber: 'fake',
      },
    });
    expect(
      mockNotificationSubmissionStatusService.setStatusDate,
    ).toBeCalledTimes(1);
    expect(
      mockNotificationSubmissionStatusService.setStatusDate,
    ).toBeCalledWith('fake', NOTIFICATION_STATUS.ALC_RESPONSE_SENT);
  });
});

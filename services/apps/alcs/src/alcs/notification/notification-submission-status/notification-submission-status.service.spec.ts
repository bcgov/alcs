import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { Repository } from 'typeorm';
import { NotificationSubmission } from '../../../portal/notification-submission/notification-submission.entity';
import { NotificationSubmissionStatusType } from './notification-status-type.entity';
import { NOTIFICATION_STATUS } from './notification-status.dto';
import { NotificationSubmissionToSubmissionStatus } from './notification-status.entity';
import { NotificationSubmissionStatusService } from './notification-submission-status.service';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('NotificationSubmissionStatusService', () => {
  let service: NotificationSubmissionStatusService;
  let mockSubmissionToSubmissionStatusRepository: DeepMocked<
    Repository<NotificationSubmissionToSubmissionStatus>
  >;
  let mockSubmissionStatusTypeRepository: DeepMocked<
    Repository<NotificationSubmissionStatusType>
  >;
  let mockNotificationSubmissionRepository: DeepMocked<
    Repository<NotificationSubmission>
  >;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));

    mockSubmissionToSubmissionStatusRepository = createMock();
    mockSubmissionStatusTypeRepository = createMock();
    mockNotificationSubmissionRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSubmissionStatusService,
        {
          provide: getRepositoryToken(NotificationSubmissionToSubmissionStatus),
          useValue: mockSubmissionToSubmissionStatusRepository,
        },
        {
          provide: getRepositoryToken(NotificationSubmissionStatusType),
          useValue: mockSubmissionStatusTypeRepository,
        },
        {
          provide: getRepositoryToken(NotificationSubmission),
          useValue: mockNotificationSubmissionRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationSubmissionStatusService>(
      NotificationSubmissionStatusService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully set initial statuses', async () => {
    mockSubmissionStatusTypeRepository.find.mockResolvedValue([
      new NotificationSubmissionStatusType({
        weight: 0,
        code: NOTIFICATION_STATUS.IN_PROGRESS,
      }),
      new NotificationSubmissionStatusType({
        weight: 1,
        code: NOTIFICATION_STATUS.ALC_RESPONSE_SENT,
      }),
    ]);

    const fakeSubmissionUuid = 'fake';

    const savedStatuses: NotificationSubmissionToSubmissionStatus[] = [
      new NotificationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOTIFICATION_STATUS.ALC_RESPONSE_SENT,
      }),
      new NotificationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      savedStatuses as any,
    );

    const result = await service.setInitialStatuses(fakeSubmissionUuid);

    expect(mockSubmissionStatusTypeRepository.find).toBeCalledTimes(1);
    expect(mockSubmissionStatusTypeRepository.find).toBeCalledWith();

    expect(mockSubmissionToSubmissionStatusRepository.save).toBeCalledTimes(1);
    expect(result).toMatchObject(savedStatuses);
  });

  it('Should return current statuses by submission uuid', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatuses = [
      new NotificationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );

    const statuses = await service.getCurrentStatusesBy(fakeSubmissionUuid);

    expect(
      mockSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledWith({
      submissionUuid: fakeSubmissionUuid,
    });
    expect(statuses).toEqual(mockStatuses);
  });

  it('Should return current statuses by fileNumber', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatuses = [
      new NotificationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );
    mockNotificationSubmissionRepository.findOneBy.mockResolvedValue(
      new NotificationSubmission({
        uuid: fakeSubmissionUuid,
        fileNumber: fakeFileNumber,
      }),
    );

    const statuses = await service.getCurrentStatusesByFileNumber(
      fakeFileNumber,
    );

    expect(
      mockSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledWith({
      submissionUuid: fakeSubmissionUuid,
    });
    expect(statuses).toEqual(mockStatuses);
    expect(
      mockNotificationSubmissionRepository.findOneBy,
    ).toHaveBeenCalledTimes(1);
    expect(mockNotificationSubmissionRepository.findOneBy).toHaveBeenCalledWith(
      {
        fileNumber: fakeFileNumber,
      },
    );
  });

  it('Should fail return current statuses by fileNumber if submission not found', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatuses = [
      new NotificationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );
    mockNotificationSubmissionRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.getCurrentStatusesByFileNumber(fakeFileNumber),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Submission does not exist for provided notification ${fakeFileNumber}. Only notifications originated in portal have statuses.`,
      ),
    );

    expect(
      mockSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledTimes(0);
    expect(
      mockNotificationSubmissionRepository.findOneBy,
    ).toHaveBeenCalledTimes(1);
  });

  it('Should set status effective date to now if no effective date passed', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatus = new NotificationSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockSubmissionToSubmissionStatusRepository.findOneOrFail.mockResolvedValue(
      mockStatus,
    );
    mockSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      mockStatus,
    );

    const result = await service.setStatusDate(
      fakeSubmissionUuid,
      NOTIFICATION_STATUS.IN_PROGRESS,
    );

    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledWith({
      where: {
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
      },
    });
    expect(result).toMatchObject(mockStatus);
  });

  it('Should set status effective date', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatus = new NotificationSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockSubmissionToSubmissionStatusRepository.findOneOrFail.mockResolvedValue(
      mockStatus,
    );
    mockSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      new NotificationSubmissionToSubmissionStatus({
        ...mockStatus,
        effectiveDate: new Date(1, 1, 1),
      }),
    );

    const result = await service.setStatusDate(
      fakeSubmissionUuid,
      NOTIFICATION_STATUS.IN_PROGRESS,
    );

    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledWith({
      where: {
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
      },
    });
    expect(result).toMatchObject(
      new NotificationSubmissionToSubmissionStatus({
        ...mockStatus,
        effectiveDate: new Date(1, 1, 1),
      }),
    );
  });

  it('Should set status effective date by fileNumber', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatus = new NotificationSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockSubmissionToSubmissionStatusRepository.findOneOrFail.mockResolvedValue(
      mockStatus,
    );
    mockSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      mockStatus,
    );
    mockNotificationSubmissionRepository.findOneBy.mockResolvedValue(
      new NotificationSubmission({
        uuid: fakeSubmissionUuid,
        fileNumber: fakeFileNumber,
      }),
    );

    const result = await service.setStatusDateByFileNumber(
      fakeFileNumber,
      NOTIFICATION_STATUS.IN_PROGRESS,
    );

    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledWith({
      where: {
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
      },
    });
    expect(result).toMatchObject(mockStatus);
    expect(
      mockNotificationSubmissionRepository.findOneBy,
    ).toHaveBeenCalledTimes(1);
    expect(mockNotificationSubmissionRepository.findOneBy).toHaveBeenCalledWith(
      {
        fileNumber: fakeFileNumber,
      },
    );
  });

  it('Should return current status by fileNumber', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatus = new NotificationSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockNotificationSubmissionRepository.findOneBy.mockResolvedValue(
      new NotificationSubmission({
        uuid: fakeSubmissionUuid,
        fileNumber: fakeFileNumber,
        status: mockStatus,
      }),
    );

    const status = await service.getCurrentStatusByFileNumber(fakeFileNumber);

    expect(status).toEqual(mockStatus);
    expect(
      mockNotificationSubmissionRepository.findOneBy,
    ).toHaveBeenCalledTimes(1);
    expect(mockNotificationSubmissionRepository.findOneBy).toHaveBeenCalledWith(
      {
        fileNumber: fakeFileNumber,
      },
    );
  });

  it('Should remove statuses', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatuses = [
      new NotificationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOTIFICATION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );
    mockSubmissionToSubmissionStatusRepository.remove.mockResolvedValue(
      {} as any,
    );

    await service.removeStatuses(fakeSubmissionUuid);

    expect(
      mockSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledWith({
      submissionUuid: fakeSubmissionUuid,
    });
    expect(mockSubmissionToSubmissionStatusRepository.remove).toBeCalledTimes(
      1,
    );
    expect(mockSubmissionToSubmissionStatusRepository.remove).toBeCalledWith(
      mockStatuses,
    );
  });
});

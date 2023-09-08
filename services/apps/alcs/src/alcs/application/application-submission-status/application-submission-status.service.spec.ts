import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { In, IsNull, Repository } from 'typeorm';
import { ApplicationSubmission } from '../../../portal/application-submission/application-submission.entity';
import { ApplicationSubmissionStatusService } from './application-submission-status.service';
import { ApplicationSubmissionStatusType } from './submission-status-type.entity';
import { SUBMISSION_STATUS } from './submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from './submission-status.entity';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('ApplicationSubmissionStatusService', () => {
  let service: ApplicationSubmissionStatusService;
  let mockApplicationSubmissionToSubmissionStatusRepository: DeepMocked<
    Repository<ApplicationSubmissionToSubmissionStatus>
  >;
  let mockSubmissionStatusTypeRepository: DeepMocked<
    Repository<ApplicationSubmissionStatusType>
  >;
  let mockApplicationSubmissionRepository: DeepMocked<
    Repository<ApplicationSubmission>
  >;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));

    mockApplicationSubmissionToSubmissionStatusRepository = createMock();
    mockSubmissionStatusTypeRepository = createMock();
    mockApplicationSubmissionRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationSubmissionStatusService,
        {
          provide: getRepositoryToken(ApplicationSubmissionToSubmissionStatus),
          useValue: mockApplicationSubmissionToSubmissionStatusRepository,
        },
        {
          provide: getRepositoryToken(ApplicationSubmissionStatusType),
          useValue: mockSubmissionStatusTypeRepository,
        },
        {
          provide: getRepositoryToken(ApplicationSubmission),
          useValue: mockApplicationSubmissionRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationSubmissionStatusService>(
      ApplicationSubmissionStatusService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully set initial statuses', async () => {
    mockSubmissionStatusTypeRepository.find.mockResolvedValue([
      new ApplicationSubmissionStatusType({
        weight: 0,
        code: SUBMISSION_STATUS.IN_PROGRESS,
      }),
      new ApplicationSubmissionStatusType({
        weight: 1,
        code: SUBMISSION_STATUS.ALC_DECISION,
      }),
    ]);

    const fakeSubmissionUuid = 'fake';

    const savedStatuses: ApplicationSubmissionToSubmissionStatus[] = [
      new ApplicationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.ALC_DECISION,
      }),
      new ApplicationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockApplicationSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      savedStatuses as any,
    );

    const result = await service.setInitialStatuses(fakeSubmissionUuid);

    expect(mockSubmissionStatusTypeRepository.find).toBeCalledTimes(1);
    expect(mockSubmissionStatusTypeRepository.find).toBeCalledWith();

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.save,
    ).toBeCalledTimes(1);
    expect(result).toMatchObject(savedStatuses);
  });

  it('Should return current statuses by submission uuid', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatuses = [
      new ApplicationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockApplicationSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );

    const statuses = await service.getStatusesByUuid(fakeSubmissionUuid);

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledWith({
      submissionUuid: fakeSubmissionUuid,
    });
    expect(statuses).toEqual(mockStatuses);
  });

  it('Should return current statuses by fileNumber', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatuses = [
      new ApplicationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockApplicationSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );
    mockApplicationSubmissionRepository.findOneBy.mockResolvedValue(
      new ApplicationSubmission({
        uuid: fakeSubmissionUuid,
        fileNumber: fakeFileNumber,
      }),
    );

    const statuses = await service.getStatusesByFileNumber(fakeFileNumber);

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledWith({
      submissionUuid: fakeSubmissionUuid,
    });
    expect(statuses).toEqual(mockStatuses);
    expect(mockApplicationSubmissionRepository.findOneBy).toHaveBeenCalledTimes(
      1,
    );
    expect(mockApplicationSubmissionRepository.findOneBy).toHaveBeenCalledWith({
      fileNumber: fakeFileNumber,
    });
  });

  it('Should fail return current statuses by fileNumber if submission not found', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatuses = [
      new ApplicationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockApplicationSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );
    mockApplicationSubmissionRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.getStatusesByFileNumber(fakeFileNumber),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Submission does not exist for provided application ${fakeFileNumber}. Only applications originated in portal have statuses.`,
      ),
    );

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledTimes(0);
    expect(mockApplicationSubmissionRepository.findOneBy).toHaveBeenCalledTimes(
      1,
    );
  });

  it('Should set status effective date to now if no effective date passed', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatus = new ApplicationSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockApplicationSubmissionToSubmissionStatusRepository.findOneOrFail.mockResolvedValue(
      mockStatus,
    );
    mockApplicationSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      mockStatus,
    );

    const result = await service.setStatusDate(
      fakeSubmissionUuid,
      SUBMISSION_STATUS.IN_PROGRESS,
    );

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledWith({
      where: {
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
      },
    });
    expect(result).toMatchObject(mockStatus);
  });

  it('Should set status effective date', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatus = new ApplicationSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockApplicationSubmissionToSubmissionStatusRepository.findOneOrFail.mockResolvedValue(
      mockStatus,
    );
    mockApplicationSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus({
        ...mockStatus,
        effectiveDate: new Date(1, 1, 1),
      }),
    );

    const result = await service.setStatusDate(
      fakeSubmissionUuid,
      SUBMISSION_STATUS.IN_PROGRESS,
    );

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledWith({
      where: {
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
      },
    });
    expect(result).toMatchObject(
      new ApplicationSubmissionToSubmissionStatus({
        ...mockStatus,
        effectiveDate: new Date(1, 1, 1),
      }),
    );
  });

  it('Should set status effective date by fileNumber', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatus = new ApplicationSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockApplicationSubmissionToSubmissionStatusRepository.findOneOrFail.mockResolvedValue(
      mockStatus,
    );
    mockApplicationSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      mockStatus,
    );
    mockApplicationSubmissionRepository.findOneBy.mockResolvedValue(
      new ApplicationSubmission({
        uuid: fakeSubmissionUuid,
        fileNumber: fakeFileNumber,
      }),
    );

    const result = await service.setStatusDateByFileNumber(
      fakeFileNumber,
      SUBMISSION_STATUS.IN_PROGRESS,
    );

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledWith({
      where: {
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
      },
    });
    expect(result).toMatchObject(mockStatus);
    expect(mockApplicationSubmissionRepository.findOneBy).toHaveBeenCalledTimes(
      1,
    );
    expect(mockApplicationSubmissionRepository.findOneBy).toHaveBeenCalledWith({
      fileNumber: fakeFileNumber,
    });
  });

  it('Should return current status by fileNumber', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatus = new ApplicationSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockApplicationSubmissionRepository.findOneBy.mockResolvedValue(
      new ApplicationSubmission({
        uuid: fakeSubmissionUuid,
        fileNumber: fakeFileNumber,
        status: mockStatus,
      }),
    );

    const status = await service.getCurrentStatusByFileNumber(fakeFileNumber);

    expect(status).toEqual(mockStatus);
    expect(mockApplicationSubmissionRepository.findOneBy).toHaveBeenCalledTimes(
      1,
    );
    expect(mockApplicationSubmissionRepository.findOneBy).toHaveBeenCalledWith({
      fileNumber: fakeFileNumber,
    });
  });

  it('Should remove statuses', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatuses = [
      new ApplicationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockApplicationSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );
    mockApplicationSubmissionToSubmissionStatusRepository.remove.mockResolvedValue(
      {} as any,
    );

    await service.removeStatuses(fakeSubmissionUuid);

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledWith({
      submissionUuid: fakeSubmissionUuid,
    });
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.remove,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.remove,
    ).toBeCalledWith(mockStatuses);
  });

  it('should return copied statuses', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeUpdatedSubmissionUuid = 'fake-updated';

    const mockStatuses = [
      new ApplicationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.ALC_DECISION,
      }),
      new ApplicationSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    const copiedStatuses = mockStatuses.map(
      (s) =>
        new ApplicationSubmissionToSubmissionStatus({
          ...s,
          submissionUuid: fakeUpdatedSubmissionUuid,
        }),
    );

    mockApplicationSubmissionToSubmissionStatusRepository.find.mockResolvedValue(
      mockStatuses,
    );

    const result = await service.getCopiedStatuses(
      fakeSubmissionUuid,
      fakeUpdatedSubmissionUuid,
    );

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.find,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.find,
    ).toBeCalledWith({
      where: { submissionUuid: fakeSubmissionUuid },
    });

    expect(result).toMatchObject(copiedStatuses);
  });

  it('should call find to retrieve ALCD and REVA statuses', async () => {
    mockApplicationSubmissionToSubmissionStatusRepository.find.mockResolvedValue(
      [],
    );
    const date = new Date();

    await service.getSubmissionToSubmissionStatusForSendingEmails(date);

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.find,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.find,
    ).toBeCalledWith({
      where: {
        statusTypeCode: In([
          SUBMISSION_STATUS.ALC_DECISION,
          SUBMISSION_STATUS.IN_REVIEW_BY_ALC,
        ]),
        emailSentDate: IsNull(),
        effectiveDate: date,
      },
      relations: {
        submission: true,
      },
    });
  });

  it('should call save to save SubmissionToSubmissionStatus', async () => {
    const mockApp = new ApplicationSubmissionToSubmissionStatus();

    mockApplicationSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      mockApp,
    );

    const result = await service.saveSubmissionToSubmissionStatus(mockApp);

    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.save,
    ).toBeCalledTimes(1);
    expect(
      mockApplicationSubmissionToSubmissionStatusRepository.save,
    ).toBeCalledWith(mockApp);
    expect(result).toEqual(mockApp);
  });
});

import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { In, IsNull, Repository } from 'typeorm';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionStatusType } from './notice-of-intent-status-type.entity';
import { NOI_SUBMISSION_STATUS } from './notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionToSubmissionStatus } from './notice-of-intent-status.entity';
import { NoticeOfIntentSubmissionStatusService } from './notice-of-intent-submission-status.service';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('NoticeOfIntentSubmissionStatusService', () => {
  let service: NoticeOfIntentSubmissionStatusService;
  let mockSubmissionToSubmissionStatusRepository: DeepMocked<
    Repository<NoticeOfIntentSubmissionToSubmissionStatus>
  >;
  let mockSubmissionStatusTypeRepository: DeepMocked<
    Repository<NoticeOfIntentSubmissionStatusType>
  >;
  let mockNoiSubmissionRepository: DeepMocked<
    Repository<NoticeOfIntentSubmission>
  >;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));

    mockSubmissionToSubmissionStatusRepository = createMock();
    mockSubmissionStatusTypeRepository = createMock();
    mockNoiSubmissionRepository = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticeOfIntentSubmissionStatusService,
        {
          provide: getRepositoryToken(
            NoticeOfIntentSubmissionToSubmissionStatus,
          ),
          useValue: mockSubmissionToSubmissionStatusRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentSubmissionStatusType),
          useValue: mockSubmissionStatusTypeRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentSubmission),
          useValue: mockNoiSubmissionRepository,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentSubmissionStatusService>(
      NoticeOfIntentSubmissionStatusService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully set initial statuses', async () => {
    mockSubmissionStatusTypeRepository.find.mockResolvedValue([
      new NoticeOfIntentSubmissionStatusType({
        weight: 0,
        code: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      }),
      new NoticeOfIntentSubmissionStatusType({
        weight: 1,
        code: NOI_SUBMISSION_STATUS.ALC_DECISION,
      }),
    ]);

    const fakeSubmissionUuid = 'fake';

    const savedStatuses: NoticeOfIntentSubmissionToSubmissionStatus[] = [
      new NoticeOfIntentSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.ALC_DECISION,
      }),
      new NoticeOfIntentSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
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
      new NoticeOfIntentSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
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
      new NoticeOfIntentSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );
    mockNoiSubmissionRepository.findOneBy.mockResolvedValue(
      new NoticeOfIntentSubmission({
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
    expect(mockNoiSubmissionRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionRepository.findOneBy).toHaveBeenCalledWith({
      fileNumber: fakeFileNumber,
    });
  });

  it('Should fail return current statuses by fileNumber if submission not found', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatuses = [
      new NoticeOfIntentSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    mockSubmissionToSubmissionStatusRepository.findBy.mockResolvedValue(
      mockStatuses,
    );
    mockNoiSubmissionRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.getCurrentStatusesByFileNumber(fakeFileNumber),
    ).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Submission does not exist for provided notice of intent ${fakeFileNumber}. Only notice of intents originated in portal have statuses.`,
      ),
    );

    expect(
      mockSubmissionToSubmissionStatusRepository.findBy,
    ).toHaveBeenCalledTimes(0);
    expect(mockNoiSubmissionRepository.findOneBy).toHaveBeenCalledTimes(1);
  });

  it('Should set status effective date to now if no effective date passed', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatus = new NoticeOfIntentSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
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
      NOI_SUBMISSION_STATUS.IN_PROGRESS,
    );

    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledWith({
      where: {
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      },
    });
    expect(result).toMatchObject(mockStatus);
  });

  it('Should set status effective date', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatus = new NoticeOfIntentSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockSubmissionToSubmissionStatusRepository.findOneOrFail.mockResolvedValue(
      mockStatus,
    );
    mockSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      new NoticeOfIntentSubmissionToSubmissionStatus({
        ...mockStatus,
        effectiveDate: new Date(1, 1, 1),
      }),
    );

    const result = await service.setStatusDate(
      fakeSubmissionUuid,
      NOI_SUBMISSION_STATUS.IN_PROGRESS,
    );

    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledWith({
      where: {
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      },
    });
    expect(result).toMatchObject(
      new NoticeOfIntentSubmissionToSubmissionStatus({
        ...mockStatus,
        effectiveDate: new Date(1, 1, 1),
      }),
    );
  });

  it('Should set status effective date by fileNumber', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatus = new NoticeOfIntentSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockSubmissionToSubmissionStatusRepository.findOneOrFail.mockResolvedValue(
      mockStatus,
    );
    mockSubmissionToSubmissionStatusRepository.save.mockResolvedValue(
      mockStatus,
    );
    mockNoiSubmissionRepository.findOneBy.mockResolvedValue(
      new NoticeOfIntentSubmission({
        uuid: fakeSubmissionUuid,
        fileNumber: fakeFileNumber,
      }),
    );

    const result = await service.setStatusDateByFileNumber(
      fakeFileNumber,
      NOI_SUBMISSION_STATUS.IN_PROGRESS,
    );

    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(
      mockSubmissionToSubmissionStatusRepository.findOneOrFail,
    ).toBeCalledWith({
      where: {
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      },
    });
    expect(result).toMatchObject(mockStatus);
    expect(mockNoiSubmissionRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionRepository.findOneBy).toHaveBeenCalledWith({
      fileNumber: fakeFileNumber,
    });
  });

  it('Should return current status by fileNumber', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeFileNumber = 'fake-number';
    const mockStatus = new NoticeOfIntentSubmissionToSubmissionStatus({
      submissionUuid: fakeSubmissionUuid,
      statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
      effectiveDate: new Date(),
    });

    mockNoiSubmissionRepository.findOneBy.mockResolvedValue(
      new NoticeOfIntentSubmission({
        uuid: fakeSubmissionUuid,
        fileNumber: fakeFileNumber,
        status: mockStatus,
      }),
    );

    const status = await service.getCurrentStatusByFileNumber(fakeFileNumber);

    expect(status).toEqual(mockStatus);
    expect(mockNoiSubmissionRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(mockNoiSubmissionRepository.findOneBy).toHaveBeenCalledWith({
      fileNumber: fakeFileNumber,
    });
  });

  it('Should remove statuses', async () => {
    const fakeSubmissionUuid = 'fake';
    const mockStatuses = [
      new NoticeOfIntentSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
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

  it('should return copied statuses', async () => {
    const fakeSubmissionUuid = 'fake';
    const fakeUpdatedSubmissionUuid = 'fake-updated';

    const mockStatuses = [
      new NoticeOfIntentSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.ALC_DECISION,
      }),
      new NoticeOfIntentSubmissionToSubmissionStatus({
        submissionUuid: fakeSubmissionUuid,
        statusTypeCode: NOI_SUBMISSION_STATUS.IN_PROGRESS,
        effectiveDate: new Date(),
      }),
    ];

    const copiedStatuses = mockStatuses.map(
      (s) =>
        new NoticeOfIntentSubmissionToSubmissionStatus({
          ...s,
          submissionUuid: fakeUpdatedSubmissionUuid,
        }),
    );

    mockSubmissionToSubmissionStatusRepository.find.mockResolvedValue(
      mockStatuses,
    );

    const result = await service.getCopiedStatuses(
      fakeSubmissionUuid,
      fakeUpdatedSubmissionUuid,
    );

    expect(mockSubmissionToSubmissionStatusRepository.find).toBeCalledTimes(1);
    expect(mockSubmissionToSubmissionStatusRepository.find).toBeCalledWith({
      where: { submissionUuid: fakeSubmissionUuid },
    });

    expect(result).toMatchObject(copiedStatuses);
  });

  it('should call find to retrieve ALCD statuses', async () => {
    mockSubmissionToSubmissionStatusRepository.find.mockResolvedValue([]);
    const date = new Date();

    await service.getSubmissionToSubmissionStatusForSendingEmails(date);

    expect(mockSubmissionToSubmissionStatusRepository.find).toBeCalledTimes(1);
    expect(mockSubmissionToSubmissionStatusRepository.find).toBeCalledWith({
      where: {
        statusTypeCode: In([NOI_SUBMISSION_STATUS.ALC_DECISION]),
        emailSentDate: IsNull(),
        effectiveDate: date,
      },
      relations: {
        submission: true,
      },
    });
  });

  it('should call save to save SubmissionToSubmissionStatus', async () => {
    const mockNoi = new NoticeOfIntentSubmissionToSubmissionStatus();

    mockSubmissionToSubmissionStatusRepository.save.mockResolvedValue(mockNoi);

    const result = await service.saveSubmissionToSubmissionStatus(mockNoi);

    expect(mockSubmissionToSubmissionStatusRepository.save).toBeCalledTimes(1);
    expect(mockSubmissionToSubmissionStatusRepository.save).toBeCalledWith(
      mockNoi,
    );
    expect(result).toEqual(mockNoi);
  });
});

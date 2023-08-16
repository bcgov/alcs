import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentOwnerProfile } from '../../../common/automapper/notice-of-intent-owner.automapper.profile';
import { NoticeOfIntentSubmissionProfile } from '../../../common/automapper/notice-of-intent-submission.automapper.profile';
import { NoticeOfIntentOwner } from '../../../portal/notice-of-intent-submission/notice-of-intent-owner/notice-of-intent-owner.entity';
import { NoticeOfIntentSubmission } from '../../../portal/notice-of-intent-submission/notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionStatusType } from '../notice-of-intent-submission-status/notice-of-intent-status-type.entity';
import { NOI_SUBMISSION_STATUS } from '../notice-of-intent-submission-status/notice-of-intent-status.dto';
import { NoticeOfIntentSubmissionStatusService } from '../notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

describe('NoticeOfIntentSubmissionService', () => {
  let service: NoticeOfIntentSubmissionService;

  let mockNoticeOfIntentSubmissionRepository: DeepMocked<
    Repository<NoticeOfIntentSubmission>
  >;
  let mockNoticeOfIntentStatusRepository: DeepMocked<
    Repository<NoticeOfIntentSubmissionStatusType>
  >;
  let mockNoticeOfIntentSubmissionStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;

  beforeEach(async () => {
    mockNoticeOfIntentSubmissionRepository = createMock();
    mockNoticeOfIntentStatusRepository = createMock();
    mockNoticeOfIntentSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoticeOfIntentSubmissionService,
        NoticeOfIntentSubmissionProfile,
        NoticeOfIntentOwnerProfile,
        {
          provide: getRepositoryToken(NoticeOfIntentSubmission),
          useValue: mockNoticeOfIntentSubmissionRepository,
        },
        {
          provide: getRepositoryToken(NoticeOfIntentSubmissionStatusType),
          useValue: mockNoticeOfIntentStatusRepository,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNoticeOfIntentSubmissionStatusService,
        },
      ],
    }).compile();

    mockNoticeOfIntentSubmissionStatusService.setStatusDate.mockResolvedValue(
      {} as any,
    );

    service = module.get<NoticeOfIntentSubmissionService>(
      NoticeOfIntentSubmissionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully find NoticeOfIntentSubmission', async () => {
    const fakeFileNumber = 'fake';

    mockNoticeOfIntentSubmissionRepository.findOneOrFail.mockResolvedValue(
      {} as NoticeOfIntentSubmission,
    );

    const result = await service.get(fakeFileNumber);

    expect(result).toBeDefined();
    expect(
      mockNoticeOfIntentSubmissionRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(mockNoticeOfIntentSubmissionRepository.findOneOrFail).toBeCalledWith(
      {
        where: { fileNumber: fakeFileNumber, isDraft: false },
        relations: {
          noticeOfIntent: {
            documents: {
              document: true,
            },
          },
          owners: {
            type: true,
          },
        },
      },
    );
  });

  it('should properly map to dto', async () => {
    const fakeSubmission = createMock<NoticeOfIntentSubmission>({
      primaryContactOwnerUuid: 'uuid',
    });
    fakeSubmission.owners = [
      new NoticeOfIntentOwner({
        uuid: 'uuid',
      }),
    ];

    const result = await service.mapToDto(fakeSubmission);

    expect(result).toBeDefined();
    expect(result.primaryContact).toBeDefined();
  });

  it('should successfully retrieve status from repo', async () => {
    mockNoticeOfIntentStatusRepository.findOneOrFail.mockResolvedValue(
      {} as NoticeOfIntentSubmissionStatusType,
    );

    const result = await service.getStatus(NOI_SUBMISSION_STATUS.ALC_DECISION);

    expect(result).toBeDefined();
    expect(mockNoticeOfIntentStatusRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockNoticeOfIntentStatusRepository.findOneOrFail).toBeCalledWith({
      where: { code: NOI_SUBMISSION_STATUS.ALC_DECISION },
    });
  });

  it('should successfully update the status', async () => {
    mockNoticeOfIntentStatusRepository.findOneOrFail.mockResolvedValue(
      {} as NoticeOfIntentSubmissionStatusType,
    );
    mockNoticeOfIntentSubmissionRepository.findOneOrFail.mockResolvedValue({
      uuid: 'fake',
    } as NoticeOfIntentSubmission);

    await service.updateStatus('fake', NOI_SUBMISSION_STATUS.ALC_DECISION);

    expect(
      mockNoticeOfIntentSubmissionRepository.findOneOrFail,
    ).toBeCalledTimes(1);
    expect(mockNoticeOfIntentSubmissionRepository.findOneOrFail).toBeCalledWith(
      {
        where: {
          fileNumber: 'fake',
        },
      },
    );
    expect(
      mockNoticeOfIntentSubmissionStatusService.setStatusDate,
    ).toBeCalledTimes(1);
    expect(
      mockNoticeOfIntentSubmissionStatusService.setStatusDate,
    ).toBeCalledWith('fake', NOI_SUBMISSION_STATUS.ALC_DECISION);
  });
});

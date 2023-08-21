import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentType } from '../../alcs/code/application-code/notice-of-intent-type/notice-of-intent-type.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { NoticeOfIntentDocumentService } from '../../alcs/notice-of-intent/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionToSubmissionStatus } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-status.entity';
import { NoticeOfIntentSubmissionStatusService } from '../../alcs/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../../alcs/notice-of-intent/notice-of-intent.service';
import { NoticeOfIntentSubmissionProfile } from '../../common/automapper/notice-of-intent-submission.automapper.profile';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { ValidatedNoticeOfIntentSubmission } from './notice-of-intent-submission-validator.service';
import {
  NoticeOfIntentSubmission,
  PORTAL_TO_ALCS_STRUCTURE_TYPES_MAPPING,
} from './notice-of-intent-submission.entity';
import { NoticeOfIntentSubmissionService } from './notice-of-intent-submission.service';

describe('NoticeOfIntentSubmissionService', () => {
  let service: NoticeOfIntentSubmissionService;
  let mockRepository: DeepMocked<Repository<NoticeOfIntentSubmission>>;
  let mockNoiService: DeepMocked<NoticeOfIntentService>;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockNoiDocService: DeepMocked<NoticeOfIntentDocumentService>;
  let mockFileNumberService: DeepMocked<FileNumberService>;
  let mockNoiStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;
  let mockNoiSubmission;

  beforeEach(async () => {
    mockRepository = createMock();
    mockNoiService = createMock();
    mockLGService = createMock();
    mockNoiDocService = createMock();
    mockFileNumberService = createMock();
    mockNoiStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        NoticeOfIntentSubmissionService,
        NoticeOfIntentSubmissionProfile,
        {
          provide: getRepositoryToken(NoticeOfIntentSubmission),
          useValue: mockRepository,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoiService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocService,
        },
        {
          provide: FileNumberService,
          useValue: mockFileNumberService,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNoiStatusService,
        },
      ],
    }).compile();

    service = module.get<NoticeOfIntentSubmissionService>(
      NoticeOfIntentSubmissionService,
    );

    mockNoiSubmission = new NoticeOfIntentSubmission({
      fileNumber: 'file-number',
      applicant: 'incognito',
      typeCode: 'fake',
      localGovernmentUuid: 'uuid',
      createdBy: new User({
        clientRoles: [],
      }),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched notice of intent', async () => {
    const noiSubmission = new NoticeOfIntentSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const app = await service.getByFileNumber(
      '',
      new User({
        clientRoles: [],
      }),
    );
    expect(app).toBe(noiSubmission);
  });

  it('should return the fetched notice of intent when fetching with user', async () => {
    const noiSubmission = new NoticeOfIntentSubmission();
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
    mockRepository.save.mockResolvedValue(new NoticeOfIntentSubmission());
    mockFileNumberService.generateNextFileNumber.mockResolvedValue(fileId);
    mockNoiService.create.mockResolvedValue(new NoticeOfIntent());
    mockNoiStatusService.setInitialStatuses.mockResolvedValue([]);

    const fileNumber = await service.create(
      'type',
      new User({
        clientRoles: [],
      }),
    );

    expect(fileNumber).toEqual(fileId);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockNoiService.create).toHaveBeenCalledTimes(1);
    expect(mockNoiStatusService.setInitialStatuses).toHaveBeenCalledTimes(1);
  });

  it('should call through for get by user', async () => {
    const noiSubmission = new NoticeOfIntentSubmission();
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
    const noiSubmission = new NoticeOfIntentSubmission();
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

  it('should use notice of intent type service for mapping DTOs', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';

    mockNoiService.listTypes.mockResolvedValue([
      new NoticeOfIntentType({
        code: typeCode,
        portalLabel: 'portalLabel',
        htmlDescription: 'htmlDescription',
        label: 'label',
      }),
    ]);

    const noiSubmission = new NoticeOfIntentSubmission({
      applicant,
      typeCode: typeCode,
      auditCreatedAt: new Date(),
      status: new NoticeOfIntentSubmissionToSubmissionStatus({
        statusTypeCode: 'status-code',
        submissionUuid: 'fake',
      }),
      createdBy: new User(),
    });
    mockRepository.findOne.mockResolvedValue(noiSubmission);

    const res = await service.mapToDTOs(
      [noiSubmission],
      new User({
        clientRoles: [],
      }),
    );
    expect(mockNoiService.listTypes).toHaveBeenCalledTimes(1);
    expect(res[0].type).toEqual('label');
    expect(res[0].applicant).toEqual(applicant);
  });

  it('should fail on submitToAlcs if error', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';
    const noticeOfIntentSubmission = new NoticeOfIntentSubmission({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
    });

    mockNoiService.submit.mockRejectedValue(new Error());

    await expect(
      service.submitToAlcs(
        noticeOfIntentSubmission as ValidatedNoticeOfIntentSubmission,
      ),
    ).rejects.toMatchObject(
      new BaseServiceException(
        `Failed to submit notice of intent: ${fileNumber}`,
      ),
    );
  });

  it('should call out to service on submitToAlcs', async () => {
    const mockNoticeOfIntent = new NoticeOfIntent({
      dateSubmittedToAlc: new Date(),
    });
    mockNoiStatusService.setStatusDate.mockResolvedValue(
      new NoticeOfIntentSubmissionToSubmissionStatus(),
    );

    mockNoiService.submit.mockResolvedValue(mockNoticeOfIntent);
    await service.submitToAlcs(
      mockNoiSubmission as ValidatedNoticeOfIntentSubmission,
    );

    expect(mockNoiService.submit).toBeCalledTimes(1);
    expect(mockNoiStatusService.setStatusDate).toHaveBeenCalledTimes(1);
  });

  it('should populate noi subtypes', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';

    const mockDate = new Date('2022-01-01');
    jest.useFakeTimers().setSystemTime(mockDate);

    const mockNoiSubmission = new NoticeOfIntentSubmission({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
      soilProposedStructures: [
        {
          type: 'Farm Structure',
        },
        {
          type: 'Residential - Principal Residence',
        },
        {
          type: 'Residential - Additional Residence',
        },
        {
          type: 'Residential - Accessory Structure',
        },
      ],
      soilIsAreaWideFilling: true,
      soilIsExtractionOrMining: true,
    });
    const mockNoticeOfIntent = new NoticeOfIntent({
      dateSubmittedToAlc: new Date(),
    });
    mockNoiStatusService.setStatusDate.mockResolvedValue(
      new NoticeOfIntentSubmissionToSubmissionStatus(),
    );

    mockNoiService.submit.mockResolvedValue(mockNoticeOfIntent);
    await service.submitToAlcs(
      mockNoiSubmission as ValidatedNoticeOfIntentSubmission,
    );

    expect(mockNoiService.submit).toHaveBeenCalledTimes(1);
    expect(mockNoiStatusService.setStatusDate).toHaveBeenCalledTimes(1);
    expect(mockNoiService.submit).toHaveBeenCalledWith({
      applicant,
      fileNumber,
      localGovernmentUuid,
      dateSubmittedToAlc: mockDate,
      typeCode,
      subtypes: [
        PORTAL_TO_ALCS_STRUCTURE_TYPES_MAPPING.RESIDENTIAL_ACCESSORY_STRUCTURE
          .alcsValueCode,
        PORTAL_TO_ALCS_STRUCTURE_TYPES_MAPPING.RESIDENTIAL_ADDITIONAL_RESIDENCE
          .alcsValueCode,
        PORTAL_TO_ALCS_STRUCTURE_TYPES_MAPPING.RESIDENTIAL_PRINCIPAL_RESIDENCE
          .alcsValueCode,
        PORTAL_TO_ALCS_STRUCTURE_TYPES_MAPPING.FARM_STRUCTURE.alcsValueCode,
        'ARWF',
        'AEPM',
      ],
    });
  });

  it('should update fields if notice of intent exists', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';

    mockRepository.findOneOrFail.mockResolvedValue(mockNoiSubmission);
    mockRepository.save.mockResolvedValue(mockNoiSubmission);
    mockNoiService.update.mockResolvedValue(new NoticeOfIntent());

    const result = await service.update(
      fileNumber,
      {
        applicant,
        typeCode,
        localGovernmentUuid,
      },
      new User({
        clientRoles: [],
      }),
    );

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(2);
  });
});

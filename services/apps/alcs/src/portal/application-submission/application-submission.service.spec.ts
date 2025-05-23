import {
  BaseServiceException,
  ServiceNotFoundException,
} from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationSubmissionStatusService } from '../../alcs/application/application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationType } from '../../alcs/code/application-code/application-type/application-type.entity';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { ApplicationSubmissionProfile } from '../../common/automapper/application-submission.automapper.profile';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { GenerateReviewDocumentService } from '../pdf-generation/generate-review-document.service';
import { GenerateSubmissionDocumentService } from '../pdf-generation/generate-submission-document.service';
import { ValidatedApplicationSubmission } from './application-submission-validator.service';
import { ApplicationSubmission } from './application-submission.entity';
import { ApplicationSubmissionService } from './application-submission.service';
import { NaruSubtype } from './naru-subtype/naru-subtype.entity';
import { ApplicationTagService } from '../../alcs/application/application-tag/application-tag.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;
  let mockRepository: DeepMocked<Repository<ApplicationSubmission>>;
  let mockStatusRepository: DeepMocked<
    Repository<ApplicationSubmissionStatusType>
  >;
  let mockNaruSubtypeRepository: DeepMocked<Repository<NaruSubtype>>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationTagService: DeepMocked<ApplicationTagService>;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockGenerateSubmissionDocumentService: DeepMocked<GenerateSubmissionDocumentService>;
  let mockGenerateReviewDocumentService: DeepMocked<GenerateReviewDocumentService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockFileNumberService: DeepMocked<FileNumberService>;
  let mockQueryBuilder;
  let mockUser;

  beforeEach(async () => {
    mockRepository = createMock();
    mockStatusRepository = createMock();
    mockApplicationService = createMock();
    mockApplicationTagService = createMock();
    mockLGService = createMock();
    mockAppDocService = createMock();
    mockGenerateSubmissionDocumentService = createMock();
    mockGenerateReviewDocumentService = createMock();
    mockNaruSubtypeRepository = createMock();
    mockApplicationSubmissionStatusService = createMock();
    mockFileNumberService = createMock();

    mockUser = new User({
      clientRoles: [],
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationSubmissionService,
        ApplicationSubmissionProfile,
        {
          provide: ApplicationTagService,
          useValue: mockApplicationTagService,
        },
        {
          provide: getRepositoryToken(ApplicationSubmission),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ApplicationSubmissionStatusType),
          useValue: mockStatusRepository,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: GenerateSubmissionDocumentService,
          useValue: mockGenerateSubmissionDocumentService,
        },
        {
          provide: GenerateReviewDocumentService,
          useValue: mockGenerateReviewDocumentService,
        },
        {
          provide: getRepositoryToken(NaruSubtype),
          useValue: mockNaruSubtypeRepository,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
        {
          provide: FileNumberService,
          useValue: mockFileNumberService,
        },
      ],
    }).compile();

    mockApplicationSubmissionStatusService.setStatusDateByFileNumber.mockResolvedValue(
      {} as any,
    );
    mockApplicationSubmissionStatusService.setStatusDate.mockResolvedValue(
      {} as any,
    );

    service = module.get<ApplicationSubmissionService>(
      ApplicationSubmissionService,
    );

    mockQueryBuilder = createMock<SelectQueryBuilder<ApplicationSubmission>>();
    mockQueryBuilder.leftJoin.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.andWhere.mockReturnValue(mockQueryBuilder);
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

  it('should return the fetched application', async () => {
    const application = new ApplicationSubmission();
    mockRepository.findOne.mockResolvedValue(application);

    const app = await service.getOrFailByFileNumber('');
    expect(app).toBe(application);
  });

  it('should return the fetched application when fetching with user', async () => {
    const application = new ApplicationSubmission();
    mockRepository.findOne.mockResolvedValue(application);

    const app = await service.getIfCreatorByFileNumber('', mockUser);
    expect(app).toBe(application);
  });

  it('should throw an exception if the application is not found the fetched application', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const promise = service.getIfCreatorByFileNumber('', mockUser);
    await expect(promise).rejects.toMatchObject(
      new Error(`Failed to load application with File ID `),
    );
  });

  it("should throw an error if application doesn't exist", async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const promise = service.getOrFailByFileNumber('');
    await expect(promise).rejects.toMatchObject(
      new Error('Failed to find document'),
    );
  });

  it('save a new application for create', async () => {
    const fileId = 'file-id';
    mockRepository.findOne.mockResolvedValue(null);
    mockStatusRepository.findOne.mockResolvedValue(
      new ApplicationSubmissionStatusType(),
    );
    mockRepository.save.mockResolvedValue(new ApplicationSubmission());
    mockFileNumberService.generateNextFileNumber.mockResolvedValue(fileId);
    mockApplicationService.create.mockResolvedValue(new Application());
    mockApplicationSubmissionStatusService.setInitialStatuses.mockResolvedValue(
      {} as any,
    );

    const fileNumber = await service.create('type', mockUser);

    expect(fileNumber).toEqual(fileId);
    expect(mockStatusRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockApplicationService.create).toHaveBeenCalledTimes(1);
    expect(
      mockApplicationSubmissionStatusService.setInitialStatuses,
    ).toHaveBeenCalledTimes(1);
  });

  it('should call through for get by user', async () => {
    const application = new ApplicationSubmission();
    mockRepository.find.mockResolvedValue([application]);

    const res = await service.getByUser(mockUser);
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0]).toBe(application);
  });

  it('should call through for getByFileId', async () => {
    const application = new ApplicationSubmission();
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.getByFileNumber('', mockUser);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(application);
  });

  it('should call through for getForGovernmentByFileId', async () => {
    const application = new ApplicationSubmission({
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.SUBMITTED_TO_LG,
        submissionUuid: 'fake',
      }),
      createdBy: new User({
        bceidBusinessGuid: 'cats',
      }),
    });
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.getForGovernmentByFileId(
      '',
      new LocalGovernment({
        uuid: '',
        name: '',
        isFirstNation: false,
        bceidBusinessGuid: 'cats',
      }),
    );
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(application);
  });

  it('should fail on getForGovernmentByFileId if application was not submitted previously', async () => {
    const submission = new ApplicationSubmission({
      uuid: 'fake-uuid',
      fileNumber: 'fake-number',
      submissionStatuses: [
        new ApplicationSubmissionToSubmissionStatus({
          statusTypeCode: SUBMISSION_STATUS.SUBMITTED_TO_LG,
          effectiveDate: null,
        }),
      ],
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.CANCELLED,
        submissionUuid: 'fake',
      }),
      createdBy: mockUser,
    });
    mockRepository.findOne.mockResolvedValue(submission);

    const promise = service.getForGovernmentByFileId(
      submission.fileNumber,
      new LocalGovernment({
        uuid: '',
        name: '',
        isFirstNation: false,
        bceidBusinessGuid: 'cats',
      }),
    );

    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException(
        `Failed to load application with File ID ${submission.fileNumber}`,
      ),
    );

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('should load the cancelled status and save the application for cancel', async () => {
    const application = new ApplicationSubmission({
      uuid: 'fake',
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.CANCELLED,
        submissionUuid: 'fake',
      }),
    });

    await service.cancel(application);

    expect(
      mockApplicationSubmissionStatusService.setStatusDate,
    ).toBeCalledTimes(1);
    expect(mockApplicationSubmissionStatusService.setStatusDate).toBeCalledWith(
      application.uuid,
      SUBMISSION_STATUS.CANCELLED,
    );
  });

  it('should update the status when submitting to local government', async () => {
    const application = new ApplicationSubmission({
      uuid: 'fake',
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.CANCELLED,
        submissionUuid: 'fake',
      }),
    });

    await service.submitToLg(application);

    expect(
      mockApplicationSubmissionStatusService.setStatusDate,
    ).toBeCalledTimes(1);
    expect(mockApplicationSubmissionStatusService.setStatusDate).toBeCalledWith(
      application.uuid,
      SUBMISSION_STATUS.SUBMITTED_TO_LG,
      undefined,
    );
  });

  it('should use application type service for mapping DTOs', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';

    mockApplicationService.fetchApplicationTypes.mockResolvedValue([
      new ApplicationType({
        code: typeCode,
        portalLabel: 'portalLabel',
        htmlDescription: 'htmlDescription',
        label: 'label',
      }),
    ]);

    const application = new ApplicationSubmission({
      applicant,
      typeCode: typeCode,
      auditCreatedAt: new Date(),
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: 'status-code',
        submissionUuid: 'fake',
      }),
    });
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.mapToDTOs([application], mockUser);
    expect(mockApplicationService.fetchApplicationTypes).toHaveBeenCalledTimes(
      1,
    );
    expect(res[0].type).toEqual('label');
    expect(res[0].applicant).toEqual(applicant);
  });

  it('should fail on submitToAlcs if error', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';
    const applicationSubmission = new ApplicationSubmission({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
    });

    mockGenerateSubmissionDocumentService.generateAndAttach.mockRejectedValue(undefined);
    mockAppDocService.list.mockResolvedValue([
      new ApplicationDocument({
        typeCode: DOCUMENT_TYPE.ORIGINAL_SUBMISSION,
      }),
    ]);
    mockApplicationService.submit.mockRejectedValue(new Error());

    try {
      await service.submitToAlcs(applicationSubmission as ValidatedApplicationSubmission, mockUser);
    } catch (err) {
      await expect([
        new BaseServiceException(`Failed to submit application: ${fileNumber}`),
        new BaseServiceException('A document failed to generate', undefined, 'DocumentGenerationError'),
      ]).toContainEqual(err);
    }
  });

  it('should call out to service on submitToAlcs', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';
    const mockApplication = new ApplicationSubmission({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: 'status-code',
        submissionUuid: 'fake',
      }),
    });
    const mockSubmittedApp = new Application({
      dateSubmittedToAlc: new Date(),
    });

    mockGenerateSubmissionDocumentService.generateAndAttach.mockRejectedValue(undefined);
    mockAppDocService.list.mockResolvedValue([
      {
        typeCode: DOCUMENT_TYPE.ORIGINAL_SUBMISSION,
      },
      {
        typeCode: DOCUMENT_TYPE.ORIGINAL_SUBMISSION,
      },
    ] as any);
    mockApplicationService.submit.mockResolvedValue(mockSubmittedApp);

    await service.submitToAlcs(
      mockApplication as ValidatedApplicationSubmission,
      mockUser,
    );

    expect(mockApplicationService.submit).toBeCalledTimes(1);

    expect(mockApplicationSubmissionStatusService.setStatusDate).toBeCalledTimes(1);
    expect(mockApplicationSubmissionStatusService.setStatusDate).toBeCalledWith(
      mockApplication.uuid,
      SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      mockSubmittedApp.dateSubmittedToAlc,
    );
  });

  it('should update fields if application exists', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';

    const mockApplication = new ApplicationSubmission({
      fileNumber,
      applicant: 'incognito',
      typeCode: 'fake',
      localGovernmentUuid: 'uuid',
    });

    mockRepository.findOne.mockResolvedValue(mockApplication);
    mockRepository.save.mockResolvedValue(mockApplication);
    mockApplicationService.updateByFileNumber.mockResolvedValue(
      new Application(),
    );

    const result = await service.update(fileNumber, {
      applicant,
      typeCode,
      localGovernmentUuid,
    });

    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOne).toBeCalledTimes(2);
    expect(result).toEqual(
      new ApplicationSubmission({
        fileNumber,
        applicant,
        typeCode,
        localGovernmentUuid,
      }),
    );
  });

  it('should delete homesite document when setting homesite to false', async () => {
    const fileNumber = 'fake';
    const mockUuid = 'uuid';

    const mockApplicationSubmission = new ApplicationSubmission({
      fileNumber,
    });

    mockRepository.findOne.mockResolvedValue(mockApplicationSubmission);
    mockRepository.save.mockResolvedValue(mockApplicationSubmission);
    mockApplicationService.getUuid.mockResolvedValue(mockUuid);
    mockAppDocService.deleteByType.mockResolvedValue();

    await service.update(fileNumber, {
      subdIsHomeSiteSeverance: false,
    });

    expect(mockAppDocService.deleteByType).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.deleteByType.mock.calls[0][0]).toEqual(
      DOCUMENT_TYPE.HOMESITE_SEVERANCE,
    );
    expect(mockAppDocService.deleteByType.mock.calls[0][1]).toEqual(mockUuid);
    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOne).toBeCalledTimes(2);
  });

  it('should call through to repo for list subtypes', async () => {
    mockNaruSubtypeRepository.find.mockResolvedValue([]);

    await service.listNaruSubtypes();

    expect(mockNaruSubtypeRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should return true for access document if its public', async () => {
    const noiSubmission = new ApplicationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new ApplicationDocument({
        visibilityFlags: [VISIBILITY_FLAG.PUBLIC],
      }),
      mockUser,
    );

    expect(res).toBe(true);
  });

  it('should return true for access document if its applicant and requesting user owns it', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new ApplicationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new ApplicationDocument({
        visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
      }),
      new User({
        ...mockUser,
        uuid: 'user_uuid',
      }),
    );

    expect(res).toBe(true);
  });

  it('should return false for access document if its applicant and requesting user does not own it', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new ApplicationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new ApplicationDocument({
        visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
      }),
      new User({
        ...mockUser,
        uuid: 'NOT_user_uuid',
      }),
    );

    expect(res).toBe(false);
  });

  it('should return true for access document if its government and requesting user is in that government', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new ApplicationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new ApplicationDocument({
        visibilityFlags: [VISIBILITY_FLAG.GOVERNMENT],
      }),
      new User({
        ...mockUser,
        bceidBusinessGuid: 'localGovernment_bceid_business_guid',
      }),
    );

    expect(res).toBe(true);
  });

  it('should return false for access document if its government and requesting user is NOT in that government', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new ApplicationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new ApplicationDocument({
        visibilityFlags: [VISIBILITY_FLAG.GOVERNMENT],
      }),
      new User({
        ...mockUser,
        bceidBusinessGuid: 'NOT_localGovernment_bceid_business_guid',
      }),
    );

    expect(res).toBe(false);
  });

  it('should return true for access document if its applicant and requesting user is in same business', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new ApplicationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new ApplicationDocument({
        visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
      }),
      new User({
        ...mockUser,
        bceidBusinessGuid: 'bceid_business_guid',
      }),
    );

    expect(res).toBe(true);
  });

  it('should return false for access document if its applicant and requesting user is NOT in same business account', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new ApplicationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canAccessDocument(
      new ApplicationDocument({
        visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
      }),
      new User({
        ...mockUser,
        bceidBusinessGuid: 'NOT_bceid_business_guid',
      }),
    );

    expect(res).toBe(false);
  });

  it('should return true for delete document if user is owner', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new ApplicationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canDeleteDocument(
      new ApplicationDocument({}),
      new User({
        ...mockUser,
        uuid: 'user_uuid',
      }),
    );

    expect(res).toBe(true);
  });

  it('should return false for delete document if user is NOT owner', async () => {
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    const noiSubmission = new ApplicationSubmission();
    mockRepository.findOneOrFail.mockResolvedValue(noiSubmission);

    const res = await service.canDeleteDocument(
      new ApplicationDocument({}),
      new User({
        ...mockUser,
        uuid: 'NOT_user_uuid',
      }),
    );

    expect(res).toBe(false);
  });
});

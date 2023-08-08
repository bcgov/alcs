import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { DOCUMENT_TYPE } from '../../document/document-code.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationType } from '../../alcs/code/application-code/application-type/application-type.entity';
import { ApplicationSubmissionStatusService } from '../../application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../../application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../application-submission-status/submission-status.entity';
import { ApplicationSubmissionProfile } from '../../common/automapper/application-submission.automapper.profile';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { GenerateReviewDocumentService } from '../pdf-generation/generate-review-document.service';
import { GenerateSubmissionDocumentService } from '../pdf-generation/generate-submission-document.service';
import { ValidatedApplicationSubmission } from './application-submission-validator.service';
import { ApplicationSubmission } from './application-submission.entity';
import { ApplicationSubmissionService } from './application-submission.service';
import { NaruSubtype } from './naru-subtype/naru-subtype.entity';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;
  let mockRepository: DeepMocked<Repository<ApplicationSubmission>>;
  let mockStatusRepository: DeepMocked<
    Repository<ApplicationSubmissionStatusType>
  >;
  let mockNaruSubtypeRepository: DeepMocked<Repository<NaruSubtype>>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockGenerateSubmissionDocumentService: DeepMocked<GenerateSubmissionDocumentService>;
  let mockGenerateReviewDocumentService: DeepMocked<GenerateReviewDocumentService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockFileNumberService: DeepMocked<FileNumberService>;

  beforeEach(async () => {
    mockRepository = createMock();
    mockStatusRepository = createMock();
    mockApplicationService = createMock();
    mockLGService = createMock();
    mockAppDocService = createMock();
    mockGenerateSubmissionDocumentService = createMock();
    mockGenerateReviewDocumentService = createMock();
    mockNaruSubtypeRepository = createMock();
    mockApplicationSubmissionStatusService = createMock();
    mockFileNumberService = createMock();

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

    const app = await service.getIfCreatorByFileNumber('', new User());
    expect(app).toBe(application);
  });

  it('should throw an exception if the application is not found the fetched application', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const promise = service.getIfCreatorByFileNumber('', new User());
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

    const fileNumber = await service.create('type', new User());

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

    const res = await service.getByUser(new User());
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0]).toBe(application);
  });

  it('should call through for getByFileId', async () => {
    const application = new ApplicationSubmission();
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.getByFileNumber('', new User());
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(application);
  });

  it('should call through for getForGovernmentByFileId', async () => {
    const application = new ApplicationSubmission({
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.SUBMITTED_TO_LG,
        submissionUuid: 'fake',
      }),
      createdBy: new User(),
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

  it('should load the canceled status and save the application for cancel', async () => {
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

    const res = await service.mapToDTOs([application], new User());
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

    mockApplicationService.submit.mockRejectedValue(new Error());

    await expect(
      service.submitToAlcs(
        applicationSubmission as ValidatedApplicationSubmission,
        new User(),
      ),
    ).rejects.toMatchObject(
      new BaseServiceException(`Failed to submit application: ${fileNumber}`),
    );
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

    mockApplicationService.submit.mockResolvedValue(mockSubmittedApp);
    await service.submitToAlcs(
      mockApplication as ValidatedApplicationSubmission,
      new User(),
    );

    expect(mockApplicationService.submit).toBeCalledTimes(1);

    expect(
      mockApplicationSubmissionStatusService.setStatusDate,
    ).toBeCalledTimes(1);
    expect(mockApplicationSubmissionStatusService.setStatusDate).toBeCalledWith(
      mockApplication.uuid,
      SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      mockSubmittedApp.dateSubmittedToAlc,
    );
  });

  it('should submit to alcs even if document generation fails', async () => {
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
    mockApplicationService.submit.mockResolvedValue(mockSubmittedApp);
    mockGenerateSubmissionDocumentService.generateAndAttach.mockRejectedValue(
      new Error('fake'),
    );

    await service.submitToAlcs(
      mockApplication as ValidatedApplicationSubmission,
      new User(),
    );

    expect(mockApplicationService.submit).toBeCalledTimes(1);
    expect(
      mockGenerateSubmissionDocumentService.generateAndAttach,
    ).toBeCalledTimes(1);
    expect(
      mockGenerateSubmissionDocumentService.generateAndAttach,
    ).rejects.toMatchObject(new Error('fake'));
    expect(
      mockApplicationSubmissionStatusService.setStatusDate,
    ).toBeCalledTimes(1);
    expect(mockApplicationSubmissionStatusService.setStatusDate).toBeCalledWith(
      mockApplication.uuid,
      SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      mockSubmittedApp.dateSubmittedToAlc,
    );
  });

  it('should submit to alcs even if document attachment to application fails', async () => {
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

    mockApplicationService.submit.mockResolvedValue(mockSubmittedApp);
    mockGenerateSubmissionDocumentService.generateAndAttach.mockRejectedValue(
      new Error('fake'),
    );

    await service.submitToAlcs(
      mockApplication as ValidatedApplicationSubmission,
      new User(),
    );

    await new Promise((r) => setTimeout(r, 100));

    expect(mockApplicationService.submit).toBeCalledTimes(1);
    expect(
      mockGenerateSubmissionDocumentService.generateAndAttach,
    ).toBeCalledTimes(1);
    expect(
      mockGenerateSubmissionDocumentService.generateAndAttach,
    ).toBeCalledWith(fileNumber, new User());
    expect(
      mockApplicationSubmissionStatusService.setStatusDate,
    ).toBeCalledTimes(1);
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
});

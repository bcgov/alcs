import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { DOCUMENT_TYPE } from '../../alcs/application/application-document/application-document-code.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationType } from '../../alcs/code/application-code/application-type/application-type.entity';
import { ApplicationSubmissionProfile } from '../../common/automapper/application-submission.automapper.profile';
import { User } from '../../user/user.entity';
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationStatus } from './application-status/application-status.entity';
import { ValidatedApplicationSubmission } from './application-submission-validator.service';
import { ApplicationSubmission } from './application-submission.entity';
import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionService', () => {
  let service: ApplicationSubmissionService;
  let mockRepository: DeepMocked<Repository<ApplicationSubmission>>;
  let mockStatusRepository: DeepMocked<Repository<ApplicationStatus>>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockLGService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockRepository = createMock();
    mockStatusRepository = createMock();
    mockApplicationService = createMock();
    mockLGService = createMock();
    mockAppDocService = createMock();

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
          provide: getRepositoryToken(ApplicationStatus),
          useValue: mockStatusRepository,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
      ],
    }).compile();

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

    const app = await service.getOrFail('');
    expect(app).toBe(application);
  });

  it('should return the fetched application when fetching with user', async () => {
    const application = new ApplicationSubmission();
    mockRepository.findOne.mockResolvedValue(application);

    const app = await service.getIfCreator('', new User());
    expect(app).toBe(application);
  });

  it('should throw an exception if the application is not found the fetched application', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const promise = service.getIfCreator('', new User());
    await expect(promise).rejects.toMatchObject(
      new Error(`Failed to load application with File ID `),
    );
  });

  it("should throw an error if application doesn't exist", async () => {
    mockRepository.findOne.mockResolvedValue(null);

    const promise = service.getOrFail('');
    await expect(promise).rejects.toMatchObject(
      new Error('Failed to find document'),
    );
  });

  it('save a new application for create', async () => {
    const fileId = 'file-id';
    mockRepository.findOne.mockResolvedValue(null);
    mockStatusRepository.findOne.mockResolvedValue(new ApplicationStatus());
    mockRepository.save.mockResolvedValue(new ApplicationSubmission());
    mockApplicationService.generateNextFileNumber.mockResolvedValue(fileId);
    mockApplicationService.create.mockResolvedValue(new Application());

    const fileNumber = await service.create('type', new User());

    expect(fileNumber).toEqual(fileId);
    expect(mockStatusRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockApplicationService.create).toHaveBeenCalledTimes(1);
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

    const res = await service.getByFileId('', new User());
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(application);
  });

  it('should call through for getForGovernmentByFileId', async () => {
    const application = new ApplicationSubmission();
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.getForGovernmentByFileId(
      '',
      new ApplicationLocalGovernment({
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
    const application = new ApplicationSubmission();
    const cancelStatus = new ApplicationStatus({
      code: APPLICATION_STATUS.CANCELLED,
    });
    mockStatusRepository.findOneOrFail.mockResolvedValue(cancelStatus);
    mockRepository.findOneOrFail.mockResolvedValue(new ApplicationSubmission());

    mockRepository.save.mockResolvedValue({} as any);

    await service.cancel(application);
    expect(mockStatusRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].status).toEqual(cancelStatus);
  });

  it('should throw an exception if it fails to load cancelled status', async () => {
    const application = new ApplicationSubmission();
    const exception = new BaseServiceException('');
    mockStatusRepository.findOneOrFail.mockRejectedValue(exception);

    const promise = service.cancel(application);
    await expect(promise).rejects.toMatchObject(exception);

    expect(mockRepository.save).toHaveBeenCalledTimes(0);
  });

  it('should update the status when submitting to local government', async () => {
    const mockStatus = new ApplicationStatus({
      code: 'code',
      label: 'label',
    });

    mockStatusRepository.findOneOrFail.mockResolvedValue(mockStatus);
    mockRepository.save.mockResolvedValue({} as any);
    mockRepository.findOneOrFail.mockResolvedValue(new ApplicationSubmission());

    await service.submitToLg(new ApplicationSubmission());
    expect(mockStatusRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].status).toEqual(mockStatus);
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
      status: new ApplicationStatus({
        code: 'status-code',
        label: '',
      }),
      statusHistory: [],
    });
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.mapToDTOs([application], new User());
    expect(mockApplicationService.fetchApplicationTypes).toHaveBeenCalledTimes(
      1,
    );
    expect(res[0].type).toEqual('label');
    expect(res[0].applicant).toEqual(applicant);
  });

  it('should fail on submitToAlcs if grpc request failed', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';
    const applicationSubmission = new ApplicationSubmission({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
      statusHistory: [],
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
      status: new ApplicationStatus({
        code: 'status-code',
        label: '',
      }),
      statusHistory: [],
    });

    mockApplicationService.submit.mockResolvedValue(new Application());

    const res = await service.submitToAlcs(
      mockApplication as ValidatedApplicationSubmission,
      new User(),
    );

    expect(mockApplicationService.submit).toBeCalledTimes(1);
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
});

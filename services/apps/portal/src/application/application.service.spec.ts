import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Observable, of } from 'rxjs';
import { Repository } from 'typeorm';
import {
  ApplicationFileNumberGenerateGrpcResponse,
  ApplicationGrpcResponse,
} from '../alcs/application-grpc/alcs-application.message.interface';
import { AlcsApplicationService } from '../alcs/application-grpc/alcs-application.service';
import { ApplicationTypeService } from '../alcs/application-type/application-type.service';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';
import { ApplicationDocument } from './application-document/application-document.entity';
import { APPLICATION_STATUS } from './application-status/application-status.dto';
import { ApplicationStatus } from './application-status/application-status.entity';
import { Application } from './application.entity';
import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let mockAppTypeService: DeepMocked<ApplicationTypeService>;
  let mockRepository: DeepMocked<Repository<Application>>;
  let mockStatusRepository: DeepMocked<Repository<ApplicationStatus>>;
  let mockAlcsApplicationService: DeepMocked<AlcsApplicationService>;

  beforeEach(async () => {
    mockRepository = createMock();
    mockStatusRepository = createMock();
    mockAppTypeService = createMock();
    mockAlcsApplicationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ApplicationService,
        ApplicationProfile,
        {
          provide: getRepositoryToken(Application),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ApplicationStatus),
          useValue: mockStatusRepository,
        },
        {
          provide: ApplicationTypeService,
          useValue: mockAppTypeService,
        },
        {
          provide: AlcsApplicationService,
          useValue: mockAlcsApplicationService,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the fetched application', async () => {
    const application = new Application();
    mockRepository.findOne.mockResolvedValue(application);

    const app = await service.getOrFail('');
    expect(app).toBe(application);
  });

  it('should return the fetched application when fetching with user', async () => {
    const application = new Application();
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
    mockRepository.save.mockResolvedValue(new Application());
    mockAlcsApplicationService.generateFileNumber.mockReturnValue(
      of({
        fileNumber: fileId,
      } as ApplicationFileNumberGenerateGrpcResponse),
    );

    const fileNumber = await service.create('type', new User());

    expect(fileNumber).toEqual(fileId);
    expect(mockStatusRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockAlcsApplicationService.generateFileNumber).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call through for get by user', async () => {
    const application = new Application();
    mockRepository.find.mockResolvedValue([application]);

    const res = await service.getByUser(new User());
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
    expect(res.length).toEqual(1);
    expect(res[0]).toBe(application);
  });

  it('should call through for getByFileId', async () => {
    const application = new Application();
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.getByFileId('', new User());
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(application);
  });

  it('should call through for getForGovernmentByFileId', async () => {
    const application = new Application();
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.getForGovernmentByFileId('', {
      uuid: '',
      name: '',
      isFirstNation: false,
    });
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(res).toBe(application);
  });

  it('should load the canceled status and save the application for cancel', async () => {
    const application = new Application();
    const cancelStatus = new ApplicationStatus({
      code: APPLICATION_STATUS.CANCELLED,
    });
    mockStatusRepository.findOne.mockResolvedValue(cancelStatus);

    mockRepository.save.mockResolvedValue(new Application());

    const res = await service.cancel(application);
    expect(res).toBeDefined();
    expect(mockStatusRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save.mock.calls[0][0].status).toEqual(cancelStatus);
  });

  it('should throw an exception if it fails to load cancelled status', async () => {
    const application = new Application();
    mockStatusRepository.findOne.mockResolvedValue(null);

    const promise = service.cancel(application);
    await expect(promise).rejects.toMatchObject(
      new BaseServiceException(
        `Failed to load Cancelled Status for Cancelling Application ${application.fileNumber}`,
      ),
    );

    expect(mockRepository.save).toHaveBeenCalledTimes(0);
  });

  it('should update the status when submitting to local government', async () => {
    const mockStatus = new ApplicationStatus({
      code: 'code',
      label: 'label',
    });

    mockStatusRepository.findOneOrFail.mockResolvedValue(mockStatus);
    mockRepository.update.mockResolvedValue({} as any);

    await service.submitToLg('fileNumber');
    expect(mockStatusRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockRepository.update.mock.calls[0][0]).toEqual({
      fileNumber: 'fileNumber',
    });
    expect(mockRepository.update.mock.calls[0][1]).toEqual({
      status: mockStatus,
    });
  });

  it('should use application type service for mapping DTOs', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';

    mockAppTypeService.list.mockResolvedValue([
      {
        code: typeCode,
        portalLabel: 'portalLabel',
        htmlDescription: 'htmlDescription',
        label: 'label',
      },
    ]);

    const application = new Application({
      applicant,
      typeCode: typeCode,
      status: new ApplicationStatus({
        code: 'status-code',
        label: '',
      }),
    });
    mockRepository.findOne.mockResolvedValue(application);

    const res = await service.mapToDTOs([application], new User());
    expect(mockAppTypeService.list).toHaveBeenCalledTimes(1);
    expect(res[0].type).toEqual('label');
    expect(res[0].applicant).toEqual(applicant);
  });

  it('should fail on submitToAlcs if grpc request failed', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';
    const mockApplication = new Application({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
      documents: [
        new ApplicationDocument({
          type: 'fake',
          document: new Document({
            alcsDocumentUuid: 'document-uuid',
          }),
        }),
      ],
    });

    mockAlcsApplicationService.create.mockImplementation(
      (): Observable<ApplicationGrpcResponse> => {
        throw new Error('failed');
      },
    );
    mockRepository.findOne.mockResolvedValue(mockApplication);
    mockRepository.save.mockResolvedValue(mockApplication);
    mockRepository.findOneOrFail.mockResolvedValue(mockApplication);

    await expect(
      service.submitToAlcs(fileNumber, {
        applicant,
        localGovernmentUuid,
      }),
    ).rejects.toMatchObject(
      new BaseServiceException(`Failed to submit application: ${fileNumber}`),
    );

    expect(mockAlcsApplicationService.create).toBeCalledTimes(1);
    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOne).toBeCalledTimes(2);
  });

  it('should call out to grpc service on submitToAlcs', async () => {
    const applicant = 'Bruce Wayne';
    const typeCode = 'fake-code';
    const fileNumber = 'fake';
    const localGovernmentUuid = 'fake-uuid';
    const mockApplication = new Application({
      fileNumber,
      applicant,
      typeCode,
      localGovernmentUuid,
      status: new ApplicationStatus({
        code: 'status-code',
        label: '',
      }),
      documents: [
        new ApplicationDocument({
          type: 'fake',
          document: new Document({
            alcsDocumentUuid: 'document-uuid',
          }),
        }),
      ],
    });

    mockAlcsApplicationService.create.mockReturnValue(
      of({ fileNumber, applicant } as ApplicationGrpcResponse),
    );
    mockRepository.update.mockResolvedValue({} as any);
    mockRepository.findOne.mockResolvedValue(mockApplication);
    mockRepository.save.mockResolvedValue(mockApplication);
    mockRepository.findOneOrFail.mockResolvedValue(mockApplication);

    mockStatusRepository.findOneOrFail.mockResolvedValue(
      new ApplicationStatus(),
    );

    const res = await service.submitToAlcs(fileNumber, {
      applicant,
      localGovernmentUuid,
    });

    expect(mockAlcsApplicationService.create).toBeCalledTimes(1);
    expect(res.applicant).toEqual(mockApplication.applicant);
    expect(res.fileNumber).toEqual(mockApplication.fileNumber);
    expect(mockRepository.save).toBeCalledTimes(1);
    expect(mockRepository.findOneOrFail).toBeCalledTimes(1);
    expect(mockRepository.findOne).toBeCalledTimes(2);
  });
});

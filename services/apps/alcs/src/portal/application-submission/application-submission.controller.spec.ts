import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../alcs/application/application-submission-status/submission-status.entity';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { User } from '../../user/user.entity';
import {
  ApplicationSubmissionValidatorService,
  ValidatedApplicationSubmission,
} from './application-submission-validator.service';
import { ApplicationSubmissionController } from './application-submission.controller';
import {
  ApplicationSubmissionDetailedDto,
  ApplicationSubmissionDto,
} from './application-submission.dto';
import { ApplicationSubmission } from './application-submission.entity';
import { ApplicationSubmissionService } from './application-submission.service';

describe('ApplicationSubmissionController', () => {
  let controller: ApplicationSubmissionController;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockLgService: DeepMocked<LocalGovernmentService>;
  let mockAppValidationService: DeepMocked<ApplicationSubmissionValidatorService>;

  const localGovernmentUuid = 'local-government';
  const applicant = 'fake-applicant';
  const bceidBusinessGuid = 'business-guid';

  beforeEach(async () => {
    mockAppSubmissionService = createMock();
    mockDocumentService = createMock();
    mockLgService = createMock();
    mockAppValidationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationSubmissionController],
      providers: [
        ApplicationProfile,
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubmissionService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: LocalGovernmentService,
          useValue: mockLgService,
        },
        {
          provide: ApplicationSubmissionValidatorService,
          useValue: mockAppValidationService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
    }).compile();

    controller = module.get<ApplicationSubmissionController>(
      ApplicationSubmissionController,
    );

    mockAppSubmissionService.update.mockResolvedValue(
      new ApplicationSubmission({
        applicant: applicant,
        localGovernmentUuid,
      }),
    );

    mockAppSubmissionService.create.mockResolvedValue('2');
    mockAppSubmissionService.getIfCreatorByFileNumber.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockAppSubmissionService.verifyAccessByFileId.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

    mockAppSubmissionService.mapToDTOs.mockResolvedValue([]);
    mockLgService.list.mockResolvedValue([
      new LocalGovernment({
        uuid: localGovernmentUuid,
        bceidBusinessGuid,
        name: 'fake-name',
        isFirstNation: false,
      }),
    ]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call out to service when fetching applications', async () => {
    mockAppSubmissionService.getByUser.mockResolvedValue([]);

    const applications = await controller.getApplications({
      user: {
        entity: new User(),
      },
    });

    expect(applications).toBeDefined();
    expect(mockAppSubmissionService.getByUser).toHaveBeenCalledTimes(1);
  });

  it('should fetch by bceid if user has same guid as a local government', async () => {
    mockAppSubmissionService.getForGovernment.mockResolvedValue([]);

    const applications = await controller.getApplications({
      user: {
        entity: new User({
          bceidBusinessGuid,
        }),
      },
    });

    expect(applications).toBeDefined();
    expect(mockAppSubmissionService.getForGovernment).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when cancelling an application', async () => {
    const mockApplication = new ApplicationSubmission({
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
        submissionUuid: 'fake',
        effectiveDate: new Date(),
      }),
    });

    mockAppSubmissionService.mapToDTOs.mockResolvedValue([
      {} as ApplicationSubmissionDto,
    ]);
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      mockApplication,
    );
    mockAppSubmissionService.cancel.mockResolvedValue();

    const application = await controller.cancel('file-id', {
      user: {
        entity: new User(),
      },
    });

    expect(application).toBeDefined();
    expect(mockAppSubmissionService.cancel).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledWith(
      'file-id',
      new User(),
    );
  });

  it('should throw an exception when trying to cancel an application that is not in progress', async () => {
    const mockApp = new ApplicationSubmission();
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue({
      ...mockApp,
      status: new ApplicationSubmissionStatusType({
        code: SUBMISSION_STATUS.CANCELLED,
      }),
    } as any);

    const promise = controller.cancel('file-id', {
      user: {
        entity: new User(),
      },
    });

    await expect(promise).rejects.toMatchObject(
      new BadRequestException('Can only cancel in progress Applications'),
    );
    expect(mockAppSubmissionService.cancel).toHaveBeenCalledTimes(0);
    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledWith(
      'file-id',
      new User(),
    );
  });

  it('should call out to service when fetching an application', async () => {
    mockAppSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as ApplicationSubmissionDetailedDto,
    );

    const application = controller.getSubmission(
      {
        user: {
          entity: new User(),
        },
      },
      '',
    );

    expect(application).toBeDefined();
    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should fetch application by bceid if user has same guid as a local government', async () => {
    mockAppSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as ApplicationSubmissionDetailedDto,
    );
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission({
        localGovernmentUuid: '',
      }),
    );

    const application = controller.getSubmission(
      {
        user: {
          entity: new User({
            bceidBusinessGuid: 'guid',
          }),
        },
      },
      '',
    );

    expect(application).toBeDefined();
    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call out to service when creating an application', async () => {
    mockAppSubmissionService.create.mockResolvedValue('');
    mockAppSubmissionService.mapToDTOs.mockResolvedValue([
      {} as ApplicationSubmissionDto,
    ]);

    const application = await controller.create(
      {
        user: {
          entity: new User(),
        },
      },
      {
        type: '',
      },
    );

    expect(application).toBeDefined();
    expect(mockAppSubmissionService.create).toHaveBeenCalledTimes(1);
  });

  it('should call out to service for update and map', async () => {
    mockAppSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as ApplicationSubmissionDetailedDto,
    );

    await controller.update(
      'file-id',
      {
        localGovernmentUuid,
        applicant,
      },
      {
        user: {
          entity: new User(),
        },
      },
    );

    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
  });

  it('should call out to service on submitAlcs if application type is TURP', async () => {
    const mockFileId = 'file-id';
    mockAppSubmissionService.submitToAlcs.mockResolvedValue(new Application());
    mockAppSubmissionService.getIfCreatorByUuid.mockResolvedValue(
      new ApplicationSubmission({
        typeCode: 'TURP',
      }),
    );
    mockAppSubmissionService.updateStatus.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );
    mockAppValidationService.validateSubmission.mockResolvedValue({
      application: new ApplicationSubmission({
        typeCode: 'TURP',
      }) as ValidatedApplicationSubmission,
      errors: [],
    });

    await controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppSubmissionService.submitToAlcs).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus).toHaveBeenCalledTimes(1);
  });

  it('should submit to LG if application type is NOT-TURP', async () => {
    const mockFileId = 'file-id';
    mockAppSubmissionService.submitToLg.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );
    mockAppSubmissionService.getIfCreatorByUuid.mockResolvedValue(
      new ApplicationSubmission({
        typeCode: 'NOT-TURP',
        localGovernmentUuid,
      }),
    );
    mockAppValidationService.validateSubmission.mockResolvedValue({
      application:
        new ApplicationSubmission() as ValidatedApplicationSubmission,
      errors: [],
    });

    await controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppSubmissionService.submitToLg).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception if application fails validation', async () => {
    const mockFileId = 'file-id';
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission({
        typeCode: 'NOT-TURP',
      }),
    );
    mockAppValidationService.validateSubmission.mockResolvedValue({
      application: undefined,
      errors: [new Error('Failed to validate')],
    });

    const promise = controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    await expect(promise).rejects.toMatchObject(
      new BadRequestException('Invalid Application'),
    );
  });
});

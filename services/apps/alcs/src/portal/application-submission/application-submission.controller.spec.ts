import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationSubmissionStatusType } from '../../application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../application-submission-status/submission-status.entity';
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
  let mockAppService: DeepMocked<ApplicationSubmissionService>;
  let mockDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockLgService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockAppValidationService: DeepMocked<ApplicationSubmissionValidatorService>;

  const localGovernmentUuid = 'local-government';
  const applicant = 'fake-applicant';
  const bceidBusinessGuid = 'business-guid';

  beforeEach(async () => {
    mockAppService = createMock();
    mockDocumentService = createMock();
    mockLgService = createMock();
    mockAppValidationService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationSubmissionController],
      providers: [
        ApplicationProfile,
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationLocalGovernmentService,
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

    mockAppService.update.mockResolvedValue(
      new ApplicationSubmission({
        applicant: applicant,
        localGovernmentUuid,
      }),
    );

    mockAppService.create.mockResolvedValue('2');
    mockAppService.getIfCreatorByFileNumber.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockAppService.verifyAccessByFileId.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockAppService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission(),
    );

    mockAppService.mapToDTOs.mockResolvedValue([]);
    mockLgService.list.mockResolvedValue([
      new ApplicationLocalGovernment({
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
    mockAppService.getByUser.mockResolvedValue([]);

    const applications = await controller.getApplications({
      user: {
        entity: new User(),
      },
    });

    expect(applications).toBeDefined();
    expect(mockAppService.getByUser).toHaveBeenCalledTimes(1);
  });

  it('should fetch by bceid if user has same guid as a local government', async () => {
    mockAppService.getForGovernment.mockResolvedValue([]);

    const applications = await controller.getApplications({
      user: {
        entity: new User({
          bceidBusinessGuid,
        }),
      },
    });

    expect(applications).toBeDefined();
    expect(mockAppService.getForGovernment).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when cancelling an application', async () => {
    const mockApplication = new ApplicationSubmission({
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
        submissionUuid: 'fake',
        effectiveDate: new Date(),
      }),
    });

    mockAppService.mapToDTOs.mockResolvedValue([
      {} as ApplicationSubmissionDto,
    ]);
    mockAppService.verifyAccessByUuid.mockResolvedValue(mockApplication);
    mockAppService.cancel.mockResolvedValue();

    const application = await controller.cancel('file-id', {
      user: {
        entity: new User(),
      },
    });

    expect(application).toBeDefined();
    expect(mockAppService.cancel).toHaveBeenCalledTimes(1);
    expect(mockAppService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
    expect(mockAppService.verifyAccessByUuid).toHaveBeenCalledWith(
      'file-id',
      new User(),
    );
  });

  it('should throw an exception when trying to cancel an application that is not in progress', async () => {
    const mockApp = new ApplicationSubmission();
    mockAppService.verifyAccessByUuid.mockResolvedValue({
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
    expect(mockAppService.cancel).toHaveBeenCalledTimes(0);
    expect(mockAppService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
    expect(mockAppService.verifyAccessByUuid).toHaveBeenCalledWith(
      'file-id',
      new User(),
    );
  });

  it('should call out to service when fetching an application', async () => {
    mockAppService.mapToDetailedDTO.mockResolvedValue(
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
    expect(mockAppService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
  });

  it('should fetch application by bceid if user has same guid as a local government', async () => {
    mockAppService.mapToDetailedDTO.mockResolvedValue(
      {} as ApplicationSubmissionDetailedDto,
    );
    mockAppService.verifyAccessByUuid.mockResolvedValue(
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
    expect(mockAppService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
  });

  it('should call out to service when creating an application', async () => {
    mockAppService.create.mockResolvedValue('');
    mockAppService.mapToDTOs.mockResolvedValue([
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
    expect(mockAppService.create).toHaveBeenCalledTimes(1);
  });

  it('should call out to service for update and map', async () => {
    mockAppService.mapToDetailedDTO.mockResolvedValue(
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

    expect(mockAppService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
    expect(mockAppService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
  });

  it('should call out to service on submitAlcs if application type is TURP', async () => {
    const mockFileId = 'file-id';
    mockAppService.submitToAlcs.mockResolvedValue(new Application());
    mockAppService.getIfCreatorByUuid.mockResolvedValue(
      new ApplicationSubmission({
        typeCode: 'TURP',
      }),
    );
    mockAppService.updateStatus.mockResolvedValue();
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

    expect(mockAppService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
    expect(mockAppService.submitToAlcs).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus).toHaveBeenCalledTimes(1);
  });

  it('should submit to LG if application type is NOT-TURP', async () => {
    const mockFileId = 'file-id';
    mockAppService.submitToLg.mockResolvedValue();
    mockAppService.getIfCreatorByUuid.mockResolvedValue(
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

    expect(mockAppService.verifyAccessByUuid).toHaveBeenCalledTimes(1);
    expect(mockAppService.submitToLg).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception if application fails validation', async () => {
    const mockFileId = 'file-id';
    mockAppService.verifyAccessByUuid.mockResolvedValue(
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

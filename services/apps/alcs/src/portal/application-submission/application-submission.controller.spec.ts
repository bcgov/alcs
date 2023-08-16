import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ServiceValidationException } from '../../../../../libs/common/src/exceptions/base.exception';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../alcs/application/application.entity';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
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
import { EmailService } from '../../providers/email/email.service';
import { ApplicationOwner } from './application-owner/application-owner.entity';
import { generateCANCHtml } from '../../../../../templates/emails/cancelled.template';
import {
  generateSUBGTurApplicantHtml,
  generateSUBGTurGovernmentHtml,
} from '../../../../../templates/emails/submitted-to-alc';
import {
  generateSUBGApplicantHtml,
  generateSUBGGovernmentHtml,
} from '../../../../../templates/emails/submitted-to-lfng';

describe('ApplicationSubmissionController', () => {
  let controller: ApplicationSubmissionController;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockLgService: DeepMocked<LocalGovernmentService>;
  let mockAppValidationService: DeepMocked<ApplicationSubmissionValidatorService>;
  let mockEmailService: DeepMocked<EmailService>;

  const localGovernmentUuid = 'local-government';
  const primaryContactOwnerUuid = 'primary-contact';
  const applicant = 'fake-applicant';
  const bceidBusinessGuid = 'business-guid';

  beforeEach(async () => {
    mockAppSubmissionService = createMock();
    mockDocumentService = createMock();
    mockLgService = createMock();
    mockAppValidationService = createMock();
    mockEmailService = createMock();

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
          provide: EmailService,
          useValue: mockEmailService,
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
        applicant,
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
    const mockOwner = new ApplicationOwner({ uuid: primaryContactOwnerUuid });
    const mockApplication = new ApplicationSubmission({
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.IN_PROGRESS,
        submissionUuid: 'fake',
        effectiveDate: new Date(),
      }),
      owners: [mockOwner],
      primaryContactOwnerUuid,
      localGovernmentUuid,
    });

    mockAppSubmissionService.mapToDTOs.mockResolvedValue([
      {} as ApplicationSubmissionDto,
    ]);
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      mockApplication,
    );
    mockAppSubmissionService.cancel.mockResolvedValue();

    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    mockEmailService.getSubmissionGovernmentOrFail.mockResolvedValue(
      mockGovernment,
    );

    mockEmailService.sendStatusEmail.mockResolvedValue();

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
    expect(mockEmailService.sendStatusEmail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendStatusEmail).toHaveBeenCalledWith({
      generateStatusHtml: generateCANCHtml,
      status: SUBMISSION_STATUS.CANCELLED,
      applicationSubmission: mockApplication,
      government: mockGovernment,
      primaryContact: mockOwner,
      ccGovernment: true,
    });
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

    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission({
        status: new ApplicationSubmissionToSubmissionStatus({
          statusTypeCode: SUBMISSION_STATUS.INCOMPLETE,
        }),
      }),
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

  it('should throw exception on update if submission is not it in "In Progress" status ', async () => {
    mockAppSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as ApplicationSubmissionDetailedDto,
    );

    const promise = controller.update(
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

    await expect(promise).rejects.toMatchObject(
      new ServiceValidationException('Not allowed to update submission'),
    );

    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should call out to service on submitAlcs if application type is TURP', async () => {
    const mockFileId = 'file-id';
    const mockOwner = new ApplicationOwner({ uuid: primaryContactOwnerUuid });
    const mockApplicationSubmission = new ApplicationSubmission({
      fileNumber: mockFileId,
      typeCode: 'TURP',
      owners: [mockOwner],
      primaryContactOwnerUuid,
      localGovernmentUuid,
    });
    mockAppSubmissionService.submitToAlcs.mockResolvedValue(new Application());
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      mockApplicationSubmission,
    );
    mockAppSubmissionService.updateStatus.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );
    mockAppValidationService.validateSubmission.mockResolvedValue({
      application: mockApplicationSubmission as ValidatedApplicationSubmission,
      errors: [],
    });

    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    mockEmailService.getSubmissionGovernmentOrFail.mockResolvedValue(
      mockGovernment,
    );

    mockEmailService.sendStatusEmail.mockResolvedValue();

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
    expect(mockEmailService.sendStatusEmail).toHaveBeenCalledTimes(2);
    expect(mockEmailService.sendStatusEmail).toHaveBeenCalledWith({
      generateStatusHtml: generateSUBGTurApplicantHtml,
      status: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
      primaryContact: mockOwner,
    });
    expect(mockEmailService.sendStatusEmail).toHaveBeenCalledWith({
      generateStatusHtml: generateSUBGTurGovernmentHtml,
      status: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
    });
  });

  it('should submit to LG if application type is NOT-TURP', async () => {
    const mockFileId = 'file-id';
    mockAppSubmissionService.submitToLg.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );
    const mockOwner = new ApplicationOwner({ uuid: primaryContactOwnerUuid });
    const mockApplicationSubmission = new ApplicationSubmission({
      typeCode: 'NOT-TURP',
      owners: [mockOwner],
      primaryContactOwnerUuid,
      localGovernmentUuid,
    });
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      mockApplicationSubmission,
    );
    mockAppValidationService.validateSubmission.mockResolvedValue({
      application:
        new ApplicationSubmission() as ValidatedApplicationSubmission,
      errors: [],
    });
    mockEmailService.sendStatusEmail.mockResolvedValue();

    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    mockEmailService.getSubmissionGovernmentOrFail.mockResolvedValue(
      mockGovernment,
    );

    await controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppSubmissionService.submitToLg).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendStatusEmail).toHaveBeenCalledTimes(2);
    expect(mockEmailService.sendStatusEmail).toHaveBeenCalledWith({
      generateStatusHtml: generateSUBGApplicantHtml,
      status: SUBMISSION_STATUS.SUBMITTED_TO_LG,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
      primaryContact: mockOwner,
    });
    expect(mockEmailService.sendStatusEmail).toHaveBeenCalledWith({
      generateStatusHtml: generateSUBGGovernmentHtml,
      status: SUBMISSION_STATUS.SUBMITTED_TO_LG,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
    });
  });

  it('should only send status email for first time non-TUR applications', async () => {
    const mockFileId = 'file-id';
    mockAppSubmissionService.submitToLg.mockResolvedValue(
      new ApplicationSubmissionToSubmissionStatus(),
    );
    const mockOwner = new ApplicationOwner({ uuid: primaryContactOwnerUuid });
    const mockApplicationSubmission = new ApplicationSubmission({
      typeCode: 'NOT-TURP',
      owners: [mockOwner],
      primaryContactOwnerUuid,
      localGovernmentUuid,
      submissionStatuses: [
        new ApplicationSubmissionToSubmissionStatus({
          statusTypeCode: SUBMISSION_STATUS.INCOMPLETE,
          submissionUuid: 'fake',
          effectiveDate: new Date(),
        }),
      ],
    });
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      mockApplicationSubmission,
    );
    mockAppValidationService.validateSubmission.mockResolvedValue({
      application:
        new ApplicationSubmission() as ValidatedApplicationSubmission,
      errors: [],
    });
    mockEmailService.sendStatusEmail.mockResolvedValue();

    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    mockEmailService.getSubmissionGovernmentOrFail.mockResolvedValue(
      mockGovernment,
    );

    await controller.submitAsApplicant(mockFileId, {
      user: {
        entity: new User(),
      },
    });

    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppSubmissionService.submitToLg).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendStatusEmail).toHaveBeenCalledTimes(0);
  });

  it('should throw an exception if application fails validation', async () => {
    const mockFileId = 'file-id';
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      new ApplicationSubmission({
        typeCode: 'NOT-TURP',
        owners: [],
      }),
    );
    mockEmailService.getSubmissionGovernmentOrFail.mockResolvedValue(
      new LocalGovernment(),
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

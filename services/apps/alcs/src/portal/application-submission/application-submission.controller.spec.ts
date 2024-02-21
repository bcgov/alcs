import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { ServiceValidationException } from '../../../../../libs/common/src/exceptions/base.exception';
import { generateCANCApplicationHtml } from '../../../../../templates/emails/cancelled';
import {
  generateSUBGNoReviewGovernmentTemplateEmail,
  generateSUBGTurApplicantHtml,
} from '../../../../../templates/emails/submitted-to-alc';
import {
  generateSUBGApplicantHtml,
  generateSUBGGovernmentHtml,
} from '../../../../../templates/emails/submitted-to-lfng';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationType } from '../../alcs/code/application-code/application-type/application-type.entity';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { TrackingService } from '../../common/tracking/tracking.service';
import { StatusEmailService } from '../../providers/email/status-email.service';
import { User } from '../../user/user.entity';
import { ApplicationOwner } from './application-owner/application-owner.entity';
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
  let mockStatusEmailService: DeepMocked<StatusEmailService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockTrackingService: DeepMocked<TrackingService>;

  const localGovernmentUuid = 'local-government';
  const primaryContactOwnerUuid = 'primary-contact';
  const applicant = 'fake-applicant';
  const bceidBusinessGuid = 'business-guid';

  beforeEach(async () => {
    mockAppSubmissionService = createMock();
    mockDocumentService = createMock();
    mockLgService = createMock();
    mockAppValidationService = createMock();
    mockStatusEmailService = createMock();
    mockApplicationService = createMock();
    mockTrackingService = createMock();

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
          provide: StatusEmailService,
          useValue: mockStatusEmailService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: TrackingService,
          useValue: mockTrackingService,
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
    mockApplicationService.fetchApplicationTypes.mockResolvedValue([
      new ApplicationType({
        code: 'TURP',
        requiresGovernmentReview: false,
      }),
      new ApplicationType({
        code: 'NOT-TURP',
        requiresGovernmentReview: true,
      }),
    ]);

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

    const applications = await controller.list({
      user: {
        entity: new User(),
      },
    });

    expect(applications).toBeDefined();
    expect(mockAppSubmissionService.getByUser).toHaveBeenCalledTimes(1);
  });

  it('should fetch by bceid if user has same guid as a local government', async () => {
    mockAppSubmissionService.getForGovernment.mockResolvedValue([]);

    const applications = await controller.list({
      user: {
        entity: new User({
          bceidBusinessGuid,
        }),
      },
    });

    expect(applications).toBeDefined();
    expect(mockAppSubmissionService.getForGovernment).toHaveBeenCalledTimes(1);
  });

  it('should call out to service and not send an email when cancelling an in progress application', async () => {
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
    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockApplication,
      primaryContact: mockOwner,
      submissionGovernment: mockGovernment,
    });

    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

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
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(0);
  });

  it('should call out to service and send an email when cancelling an under review application', async () => {
    const mockOwner = new ApplicationOwner({ uuid: primaryContactOwnerUuid });
    const mockApplication = new ApplicationSubmission({
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.RECEIVED_BY_ALC,
        submissionUuid: 'fake',
        effectiveDate: new Date(),
      }),
      owners: [mockOwner],
      primaryContactOwnerUuid,
      localGovernmentUuid,
    });
    const mockUser = new User({
      bceidBusinessGuid: 'fake-guid',
    });

    mockAppSubmissionService.mapToDTOs.mockResolvedValue([
      {} as ApplicationSubmissionDto,
    ]);
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      mockApplication,
    );
    mockAppSubmissionService.cancel.mockResolvedValue();

    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockApplication,
      primaryContact: mockOwner,
      submissionGovernment: mockGovernment,
    });
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();
    mockLgService.getByGuid.mockResolvedValue(new LocalGovernment());

    const application = await controller.cancel('file-id', {
      user: {
        entity: mockUser,
      },
    });

    expect(application).toBeDefined();
    expect(mockAppSubmissionService.cancel).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppSubmissionService.verifyAccessByUuid).toHaveBeenCalledWith(
      'file-id',
      mockUser,
    );
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      generateStatusHtml: generateCANCApplicationHtml,
      status: SUBMISSION_STATUS.CANCELLED,
      applicationSubmission: mockApplication,
      government: mockGovernment,
      parentType: 'application',
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

    const application = await controller.getSubmission(
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
    expect(mockAppSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
  });

  it('should call out to service and track view when fetching a submission by file id', async () => {
    mockTrackingService.trackView.mockResolvedValue();
    mockAppSubmissionService.mapToDetailedDTO.mockResolvedValue(
      {} as ApplicationSubmissionDetailedDto,
    );
    mockLgService.getByGuid.mockResolvedValue(new LocalGovernment());

    const application = await controller.getSubmissionByFileId(
      {
        user: {
          entity: new User({
            bceidBusinessGuid: 'cats',
          }),
        },
      },
      '',
    );

    expect(application).toBeDefined();
    expect(mockAppSubmissionService.verifyAccessByFileId).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppSubmissionService.mapToDetailedDTO).toHaveBeenCalledTimes(1);
    expect(mockTrackingService.trackView).toHaveBeenCalledTimes(1);
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
    mockLgService.getByGuid.mockResolvedValue(new LocalGovernment());

    const application = await controller.getSubmission(
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
      submission: mockApplicationSubmission as ValidatedApplicationSubmission,
      errors: [],
    });

    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockApplicationSubmission,
      primaryContact: mockOwner,
      submissionGovernment: mockGovernment,
    });

    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

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
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(2);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      generateStatusHtml: generateSUBGTurApplicantHtml,
      status: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
      parentType: 'application',
      primaryContact: mockOwner,
    });
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      generateStatusHtml: generateSUBGNoReviewGovernmentTemplateEmail,
      status: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
      parentType: 'application',
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
      submission: mockApplicationSubmission as ValidatedApplicationSubmission,
      errors: [],
    });
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockApplicationSubmission,
      primaryContact: mockOwner,
      submissionGovernment: mockGovernment,
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
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(2);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      generateStatusHtml: generateSUBGApplicantHtml,
      status: SUBMISSION_STATUS.SUBMITTED_TO_LG,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
      parentType: 'application',
      primaryContact: mockOwner,
    });
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      generateStatusHtml: generateSUBGGovernmentHtml,
      status: SUBMISSION_STATUS.SUBMITTED_TO_LG,
      applicationSubmission: mockApplicationSubmission,
      government: mockGovernment,
      parentType: 'application',
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
      submission: mockApplicationSubmission as ValidatedApplicationSubmission,
      errors: [],
    });
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    const mockGovernment = new LocalGovernment({ uuid: localGovernmentUuid });
    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockApplicationSubmission,
      primaryContact: mockOwner,
      submissionGovernment: mockGovernment,
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
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(0);
  });

  it('should throw an exception if application fails validation', async () => {
    const mockFileId = 'file-id';
    const mockApplicationSubmission = new ApplicationSubmission({
      typeCode: 'NOT-TURP',
      owners: [],
    });
    mockAppSubmissionService.verifyAccessByUuid.mockResolvedValue(
      mockApplicationSubmission,
    );
    mockStatusEmailService.getApplicationEmailData.mockResolvedValue({
      applicationSubmission: mockApplicationSubmission,
      primaryContact: new ApplicationOwner(),
      submissionGovernment: new LocalGovernment(),
    });
    mockAppValidationService.validateSubmission.mockResolvedValue({
      submission: undefined,
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

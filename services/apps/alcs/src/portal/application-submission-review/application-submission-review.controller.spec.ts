import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { template as rffgTemplate } from '../../../../../templates/emails/refused-to-forward.template';
import { template as incmTemplate } from '../../../../../templates/emails/returned-as-incomplete.template';
import { template as submApplicationTemplate } from '../../../../../templates/emails/submitted-to-alc/application.template';
import { template as wrngTemplate } from '../../../../../templates/emails/wrong-lfng.template';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationDocument } from '../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { ApplicationSubmissionStatusService } from '../../alcs/application/application-submission-status/application-submission-status.service';
import { ApplicationSubmissionStatusType } from '../../alcs/application/application-submission-status/submission-status-type.entity';
import { SUBMISSION_STATUS } from '../../alcs/application/application-submission-status/submission-status.dto';
import { ApplicationSubmissionToSubmissionStatus } from '../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../alcs/application/application.entity';
import { LocalGovernment } from '../../alcs/local-government/local-government.entity';
import { LocalGovernmentService } from '../../alcs/local-government/local-government.service';
import { OwnerType } from '../../common/owner-type/owner-type.entity';
import {
  DOCUMENT_TYPE,
  DocumentCode,
} from '../../document/document-code.entity';
import { DOCUMENT_SOURCE } from '../../document/document.dto';
import { Document } from '../../document/document.entity';
import { StatusEmailService } from '../../providers/email/status-email.service';
import { User } from '../../user/user.entity';
import { ApplicationOwner } from '../application-submission/application-owner/application-owner.entity';
import {
  ApplicationSubmissionValidatorService,
  ValidatedApplicationSubmission,
} from '../application-submission/application-submission-validator.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { ApplicationSubmissionReviewController } from './application-submission-review.controller';
import { ApplicationSubmissionReviewDto } from './application-submission-review.dto';
import { ApplicationSubmissionReview } from './application-submission-review.entity';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

describe('ApplicationSubmissionReviewController', () => {
  let controller: ApplicationSubmissionReviewController;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockAppValidatorService: DeepMocked<ApplicationSubmissionValidatorService>;
  let mockStatusEmailService: DeepMocked<StatusEmailService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;

  const mockLG = new LocalGovernment({
    isFirstNation: false,
    isActive: true,
    bceidBusinessGuid: '',
    name: '',
    uuid: '',
  });

  let applicationReview;
  const fileNumber = '123';

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppSubmissionService = createMock();
    mockLGService = createMock();
    mockAppDocService = createMock();
    mockAppValidatorService = createMock();
    mockStatusEmailService = createMock();

    applicationReview = new ApplicationSubmissionReview({
      applicationFileNumber: fileNumber,
    });

    mockAppReviewService.mapToDto.mockResolvedValue(
      {} as ApplicationSubmissionReviewDto,
    );
    mockApplicationSubmissionStatusService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationSubmissionReviewController],
      providers: [
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubmissionService,
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
          provide: ApplicationSubmissionValidatorService,
          useValue: mockAppValidatorService,
        },
        {
          provide: StatusEmailService,
          useValue: mockStatusEmailService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
      ],
    }).compile();

    mockApplicationSubmissionStatusService.setStatusDate.mockResolvedValue(
      {} as any,
    );

    controller = module.get<ApplicationSubmissionReviewController>(
      ApplicationSubmissionReviewController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should check users local government and return the file for get', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.getByFileNumber.mockResolvedValue(applicationReview);
    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission(),
    );

    const res = await controller.get(fileNumber, {
      user: {
        entity: new User({
          bceidBusinessGuid: 'fake-guid',
        }),
      },
    });
    expect(res).toBeDefined();
    expect(mockAppReviewService.mapToDto).toHaveBeenCalledTimes(1);
  });

  it('should fallback to load by owner if user has no government', async () => {
    const reviewWithApp = new ApplicationSubmissionReview({
      ...applicationReview,
      application: new Application(),
    });

    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.getByFileNumber.mockResolvedValue(reviewWithApp);
    mockAppSubmissionService.getByFileNumber.mockResolvedValue(
      new ApplicationSubmission({
        localGovernmentUuid: mockLG.uuid,
        status: new ApplicationSubmissionToSubmissionStatus({
          statusTypeCode: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
          effectiveDate: new Date(1, 1, 1),
          submissionUuid: 'fake',
        }),
      }),
    );

    mockLGService.list.mockResolvedValue([mockLG]);

    const res = await controller.get(fileNumber, {
      user: {
        entity: new User({}),
      },
    });
    expect(res).toBeDefined();
  });

  it('should update the applications status when calling create', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.startReview.mockResolvedValue(applicationReview);

    const user = new User({
      bceidBusinessGuid: 'id',
    });

    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission({
        owners: [],
        createdBy: user,
      }),
    );
    mockAppSubmissionService.updateStatus.mockResolvedValue({} as any);

    await controller.create(fileNumber, {
      user: {
        entity: user,
      },
    });

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(2);
    expect(mockAppReviewService.startReview).toHaveBeenCalledTimes(1);
    expect(
      mockAppSubmissionService.getForGovernmentByFileId,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus.mock.calls[0][1]).toEqual(
      SUBMISSION_STATUS.IN_REVIEW_BY_LG,
    );
  });

  it('should send an email through the service when creating with a valid primary contact', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.startReview.mockResolvedValue(applicationReview);
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    const user = new User({
      bceidBusinessGuid: 'id',
    });

    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission({
        owners: [
          new ApplicationOwner({
            uuid: 'uuid',
            email: 'fake-email',
            type: new OwnerType(),
          }),
        ],
        primaryContactOwnerUuid: 'uuid',
        createdBy: user,
      }),
    );
    mockAppSubmissionService.updateStatus.mockResolvedValue({} as any);
    mockAppSubmissionService.getStatus.mockResolvedValue(
      new ApplicationSubmissionStatusType({
        label: '',
      }),
    );

    await controller.create(fileNumber, {
      user: {
        entity: user,
      },
    });

    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(1);
    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(2);
    expect(mockAppReviewService.startReview).toHaveBeenCalledTimes(1);
    expect(
      mockAppSubmissionService.getForGovernmentByFileId,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus.mock.calls[0][1]).toEqual(
      SUBMISSION_STATUS.IN_REVIEW_BY_LG,
    );
  });

  it('should call through to the service for update', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.update.mockResolvedValue(applicationReview);
    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission(),
    );

    await controller.update(
      fileNumber,
      {
        user: {
          entity: new User({
            bceidBusinessGuid: 'id',
          }),
        },
      },
      {},
    );

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.update).toHaveBeenCalledTimes(1);
  });

  it('should throw an exception when trying to finish a review on an application not in review', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission({
        status: new ApplicationSubmissionToSubmissionStatus({
          statusTypeCode: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
          effectiveDate: new Date(1, 1, 1),
          submissionUuid: 'fake',
        }),
      }),
    );
    mockAppReviewService.verifyComplete.mockReturnValue(applicationReview);
    mockAppReviewService.getByFileNumber.mockResolvedValue(applicationReview);
    mockAppValidatorService.validateSubmission.mockResolvedValue({
      submission: new ApplicationSubmission() as ValidatedApplicationSubmission,
      errors: [],
    });
    mockAppDocService.list.mockResolvedValue([]);

    const promise = controller.finish(fileNumber, {
      user: {
        entity: new User({
          bceidBusinessGuid: 'id',
        }),
      },
    });

    await expect(promise).rejects.toMatchObject(
      new BaseServiceException('Application not in correct status'),
    );

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.verifyComplete).toHaveBeenCalledTimes(1);
  });

  it('should load review and call submitToAlcs when in correct status for finish', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);

    const mockOwner = new ApplicationOwner({ uuid: '1234' });
    const mockSubmission = new ApplicationSubmission({
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.IN_REVIEW_BY_LG,
        effectiveDate: new Date(1, 1, 1),
        submissionUuid: 'fake',
      }),
      owners: [mockOwner],
      primaryContactOwnerUuid: '1234',
    });
    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      mockSubmission,
    );
    mockAppReviewService.getByFileNumber.mockResolvedValue(applicationReview);
    mockAppDocService.list.mockResolvedValue([]);
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    mockAppReviewService.verifyComplete.mockReturnValue({
      ...applicationReview,
      isAuthorized: true,
    });

    mockAppValidatorService.validateSubmission.mockResolvedValue({
      submission: new ApplicationSubmission() as ValidatedApplicationSubmission,
      errors: [],
    });

    mockAppSubmissionService.submitToAlcs.mockResolvedValue(
      new Application({
        fileNumber: '',
        applicant: '',
        localGovernmentUuid: '',
        regionCode: '',
        typeCode: '',
      }),
    );

    mockAppSubmissionService.updateStatus.mockResolvedValue({} as any);

    await controller.finish(fileNumber, {
      user: {
        entity: new User({
          bceidBusinessGuid: 'id',
        }),
      },
    });

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(
      mockAppSubmissionService.getForGovernmentByFileId,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.verifyComplete).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.submitToAlcs).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus.mock.calls[0][1]).toEqual(
      SUBMISSION_STATUS.SUBMITTED_TO_ALC,
    );
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      template: submApplicationTemplate,
      status: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      applicationSubmission: mockSubmission,
      government: mockLG,
      parentType: 'application',
      primaryContact: mockOwner,
      ccGovernment: true,
      ccEmails: [],
    });
  });

  it('should load review and call submitToAlcs and set to refused to forward when not authorized', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);

    const mockOwner = new ApplicationOwner({ uuid: '1234' });
    const mockSubmission = new ApplicationSubmission({
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.IN_REVIEW_BY_LG,
        effectiveDate: new Date(1, 1, 1),
        submissionUuid: 'fake',
      }),
      owners: [new ApplicationOwner({ uuid: '1234' })],
      primaryContactOwnerUuid: '1234',
    });
    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      mockSubmission,
    );
    mockAppSubmissionService.submitToAlcs.mockResolvedValue(
      new Application({
        fileNumber: '',
        applicant: '',
        localGovernmentUuid: '',
        regionCode: '',
        typeCode: '',
      }),
    );

    mockAppReviewService.verifyComplete.mockReturnValue({
      ...applicationReview,
      isAuthorized: false,
    });
    mockAppReviewService.getByFileNumber.mockResolvedValue(applicationReview);
    mockAppValidatorService.validateSubmission.mockResolvedValue({
      submission: new ApplicationSubmission() as ValidatedApplicationSubmission,
      errors: [],
    });
    mockAppSubmissionService.updateStatus.mockResolvedValue({} as any);
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();
    mockAppDocService.list.mockResolvedValue([]);

    await controller.finish(fileNumber, {
      user: {
        entity: new User({
          bceidBusinessGuid: 'id',
        }),
      },
    });

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(
      mockAppSubmissionService.getForGovernmentByFileId,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.verifyComplete).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.submitToAlcs).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus.mock.calls[0][1]).toEqual(
      SUBMISSION_STATUS.REFUSED_TO_FORWARD_LG,
    );
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      template: rffgTemplate,
      status: SUBMISSION_STATUS.REFUSED_TO_FORWARD_LG,
      applicationSubmission: mockSubmission,
      government: mockLG,
      parentType: 'application',
      primaryContact: mockOwner,
      ccGovernment: true,
      ccEmails: [],
    });
  });

  it('should update the status, delete documents, and update the application for return', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);

    const mockOwner = new ApplicationOwner({ uuid: '1234' });
    const mockSubmission = new ApplicationSubmission({
      uuid: 'submission-uuid',
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.IN_REVIEW_BY_LG,
        effectiveDate: new Date(1, 1, 1),
        submissionUuid: 'fake',
      }),
      owners: [mockOwner],
      primaryContactOwnerUuid: '1234',
    });

    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      mockSubmission,
    );
    mockAppSubmissionService.updateStatus.mockResolvedValue({} as any);
    mockAppReviewService.getByFileNumber.mockResolvedValue(applicationReview);
    mockAppReviewService.delete.mockResolvedValue();
    mockAppDocService.delete.mockResolvedValue({} as any);
    mockAppSubmissionService.update.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    const documents = [
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
        document: new Document({
          source: DOCUMENT_SOURCE.LFNG,
        }),
      }),
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        }),
        document: new Document({
          source: DOCUMENT_SOURCE.APPLICANT,
        }),
      }),
    ];
    mockAppDocService.list.mockResolvedValue(documents);

    await controller.return(
      fileNumber,
      {
        user: {
          entity: new User({
            bceidBusinessGuid: 'id',
          }),
        },
      },
      {
        reasonForReturn: 'incomplete',
        applicantComment: 'test-comment',
      },
    );

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(
      mockAppSubmissionService.getForGovernmentByFileId,
    ).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.getByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus).toHaveBeenCalledTimes(2);
    expect(mockAppDocService.delete).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.delete).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.updateStatus.mock.calls[1][1]).toEqual(
      SUBMISSION_STATUS.INCOMPLETE,
    );
    expect(mockAppSubmissionService.updateStatus.mock.calls[0][1]).toEqual(
      SUBMISSION_STATUS.WRONG_GOV,
    );
    expect(mockAppSubmissionService.update).toHaveBeenCalledTimes(1);
    expect(mockAppSubmissionService.update.mock.calls[0][0]).toEqual(
      'submission-uuid',
    );
    expect(mockAppSubmissionService.update.mock.calls[0][1]).toEqual({
      returnedComment: 'test-comment',
    });
    expect(
      mockApplicationSubmissionStatusService.setStatusDate,
    ).toHaveBeenCalledTimes(3);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      template: incmTemplate,
      status: SUBMISSION_STATUS.INCOMPLETE,
      applicationSubmission: mockSubmission,
      government: mockLG,
      parentType: 'application',
      primaryContact: mockOwner,
      ccGovernment: true,
      ccEmails: [],
    });
  });

  it('should send the correct email template for wrong government return', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);

    const mockOwner = new ApplicationOwner({ uuid: '1234' });
    const mockSubmission = new ApplicationSubmission({
      uuid: 'submission-uuid',
      status: new ApplicationSubmissionToSubmissionStatus({
        statusTypeCode: SUBMISSION_STATUS.IN_REVIEW_BY_LG,
        effectiveDate: new Date(1, 1, 1),
        submissionUuid: 'fake',
      }),
      owners: [mockOwner],
      primaryContactOwnerUuid: '1234',
    });

    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      mockSubmission,
    );
    mockAppSubmissionService.updateStatus.mockResolvedValue({} as any);
    mockAppReviewService.getByFileNumber.mockResolvedValue(applicationReview);
    mockAppReviewService.delete.mockResolvedValue();
    mockAppDocService.delete.mockResolvedValue({} as any);
    mockAppSubmissionService.update.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockStatusEmailService.sendApplicationStatusEmail.mockResolvedValue();

    const documents = [
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
        }),
        document: new Document({
          source: DOCUMENT_SOURCE.LFNG,
        }),
      }),
      new ApplicationDocument({
        type: new DocumentCode({
          code: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
        }),
        document: new Document({
          source: DOCUMENT_SOURCE.APPLICANT,
        }),
      }),
    ];
    mockAppDocService.list.mockResolvedValue(documents);

    await controller.return(
      fileNumber,
      {
        user: {
          entity: new User({
            bceidBusinessGuid: 'id',
          }),
        },
      },
      {
        reasonForReturn: 'wrongGovernment',
        applicantComment: 'test-comment',
      },
    );

    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockStatusEmailService.sendApplicationStatusEmail,
    ).toHaveBeenCalledWith({
      template: wrngTemplate,
      status: SUBMISSION_STATUS.WRONG_GOV,
      applicationSubmission: mockSubmission,
      government: mockLG,
      parentType: 'application',
      primaryContact: mockOwner,
      ccEmails: [],
    });
  });

  it('should throw an exception when trying to return an application not in review', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppSubmissionService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission({
        status: new ApplicationSubmissionToSubmissionStatus({
          statusTypeCode: SUBMISSION_STATUS.SUBMITTED_TO_ALC,
          effectiveDate: new Date(1, 1, 1),
          submissionUuid: 'fake',
        }),
      }),
    );
    mockAppReviewService.getByFileNumber.mockResolvedValue(applicationReview);

    const promise = controller.return(
      fileNumber,
      {
        user: {
          entity: new User({
            bceidBusinessGuid: 'id',
          }),
        },
      },
      {
        applicantComment: '',
        reasonForReturn: 'incomplete',
      },
    );

    await expect(promise).rejects.toMatchObject(
      new BaseServiceException('Application not in correct status'),
    );

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.getByFileNumber).toHaveBeenCalledTimes(1);
  });
});

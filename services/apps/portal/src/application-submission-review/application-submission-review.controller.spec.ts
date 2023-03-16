import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../test/mocks/mockTypes';
import { LocalGovernmentService } from '../alcs/local-government/local-government.service';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from '../application-submission/application-document/application-document.entity';
import { ApplicationDocumentService } from '../application-submission/application-document/application-document.service';
import { APPLICATION_STATUS } from '../application-submission/application-status/application-status.dto';
import {
  ApplicationSubmissionValidatorService,
  ValidatedApplicationSubmission,
} from '../application-submission/application-submission-validator.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { User } from '../user/user.entity';
import { ApplicationSubmissionReviewController } from './application-submission-review.controller';
import { ApplicationSubmissionReviewDto } from './application-submission-review.dto';
import { ApplicationSubmissionReview } from './application-submission-review.entity';
import {
  ApplicationSubmissionReviewService,
  CompletedApplicationSubmissionReview,
} from './application-submission-review.service';

describe('ApplicationSubmissionReviewController', () => {
  let controller: ApplicationSubmissionReviewController;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;
  let mockAppService: DeepMocked<ApplicationSubmissionService>;
  let mockLGService: DeepMocked<LocalGovernmentService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockAppValidatorService: DeepMocked<ApplicationSubmissionValidatorService>;

  const mockLG = {
    isFirstNation: false,
    isActive: true,
    bceidBusinessGuid: '',
    name: '',
    uuid: '',
  };

  let applicationReview;
  const fileNumber = '123';

  beforeEach(async () => {
    mockAppReviewService = createMock();
    mockAppService = createMock();
    mockLGService = createMock();
    mockAppDocService = createMock();
    mockAppValidatorService = createMock();

    applicationReview = new ApplicationSubmissionReview({
      applicationFileNumber: fileNumber,
    });

    mockAppReviewService.mapToDto.mockResolvedValue(
      {} as ApplicationSubmissionReviewDto,
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationSubmissionReviewController],
      providers: [
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppService,
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
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationSubmissionReviewController>(
      ApplicationSubmissionReviewController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should check users local government and return the file for get', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.getForGovernment.mockResolvedValue(applicationReview);

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
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.getForGovernment.mockResolvedValue(null);
    mockLGService.get.mockResolvedValue([
      {
        bceidBusinessGuid: '',
        uuid: 'uuid',
        name: '',
        isFirstNation: false,
      },
    ]);

    const reviewWithApp = new ApplicationSubmissionReview({
      ...applicationReview,
      application: new ApplicationSubmission({
        statusCode: APPLICATION_STATUS.SUBMITTED_TO_ALC,
        localGovernmentUuid: 'uuid',
      }),
    });

    mockAppReviewService.getForOwner.mockResolvedValue(reviewWithApp);

    const res = await controller.get(fileNumber, {
      user: {
        entity: new User({}),
      },
    });
    expect(res).toBeDefined();
  });

  it('should throw an exception when user loads review that is not complete', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.getForGovernment.mockResolvedValue(null);
    mockLGService.get.mockResolvedValue([
      {
        bceidBusinessGuid: '',
        uuid: 'uuid',
        name: '',
        isFirstNation: false,
      },
    ]);

    const reviewWithApp = new ApplicationSubmissionReview({
      ...applicationReview,
      application: new ApplicationSubmission({
        statusCode: APPLICATION_STATUS.IN_REVIEW,
        localGovernmentUuid: 'uuid',
      }),
    });

    mockAppReviewService.getForOwner.mockResolvedValue(reviewWithApp);

    const promise = controller.get(fileNumber, {
      user: {
        entity: new User({}),
      },
    });
    await expect(promise).rejects.toMatchObject(
      new Error('Failed to load review'),
    );
  });

  it('update the applications status when calling create', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.startReview.mockResolvedValue(applicationReview);
    mockAppService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission(),
    );
    mockAppService.updateStatus.mockResolvedValue({} as any);

    await controller.create(fileNumber, {
      user: {
        entity: new User({
          bceidBusinessGuid: 'id',
        }),
      },
    });

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.startReview).toHaveBeenCalledTimes(1);
    expect(mockAppService.getForGovernmentByFileId).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus.mock.calls[0][1]).toEqual(
      APPLICATION_STATUS.IN_REVIEW,
    );
  });

  it('should call through to the service for update', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppReviewService.update.mockResolvedValue(applicationReview);

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
    mockAppService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission({
        statusCode: APPLICATION_STATUS.SUBMITTED_TO_ALC,
      }),
    );
    mockAppReviewService.verifyComplete.mockReturnValue(
      applicationReview as CompletedApplicationSubmissionReview,
    );
    mockAppReviewService.getForGovernment.mockResolvedValue(applicationReview);
    mockAppValidatorService.validateApplication.mockResolvedValue({
      application:
        new ApplicationSubmission() as ValidatedApplicationSubmission,
      errors: [],
    });

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
    mockAppService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission({ statusCode: APPLICATION_STATUS.IN_REVIEW }),
    );
    mockAppService.submitToAlcs.mockResolvedValue({
      fileNumber: '',
      applicant: '',
      localGovernmentUuid: '',
      dateSubmittedToAlc: '',
      regionCode: '',
      typeCode: '',
    });
    mockAppReviewService.verifyComplete.mockReturnValue({
      ...applicationReview,
      isAuthorized: true,
    } as CompletedApplicationSubmissionReview);
    mockAppReviewService.getForGovernment.mockResolvedValue(applicationReview);
    mockAppValidatorService.validateApplication.mockResolvedValue({
      application:
        new ApplicationSubmission() as ValidatedApplicationSubmission,
      errors: [],
    });
    mockAppService.updateStatus.mockResolvedValue({} as any);

    await controller.finish(fileNumber, {
      user: {
        entity: new User({
          bceidBusinessGuid: 'id',
        }),
      },
    });

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(mockAppService.getForGovernmentByFileId).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.getForGovernment).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.verifyComplete).toHaveBeenCalledTimes(1);
    expect(mockAppService.submitToAlcs).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus.mock.calls[0][1]).toEqual(
      APPLICATION_STATUS.SUBMITTED_TO_ALC,
    );
  });

  it('should load review and call submitToAlcs and set to refused to forward when not authorized', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission({ statusCode: APPLICATION_STATUS.IN_REVIEW }),
    );
    mockAppService.submitToAlcs.mockResolvedValue({
      fileNumber: '',
      applicant: '',
      localGovernmentUuid: '',
      dateSubmittedToAlc: '',
      regionCode: '',
      typeCode: '',
    });
    mockAppReviewService.verifyComplete.mockReturnValue({
      ...applicationReview,
      isAuthorized: false,
    } as CompletedApplicationSubmissionReview);
    mockAppReviewService.getForGovernment.mockResolvedValue(applicationReview);
    mockAppValidatorService.validateApplication.mockResolvedValue({
      application:
        new ApplicationSubmission() as ValidatedApplicationSubmission,
      errors: [],
    });
    mockAppService.updateStatus.mockResolvedValue({} as any);

    await controller.finish(fileNumber, {
      user: {
        entity: new User({
          bceidBusinessGuid: 'id',
        }),
      },
    });

    expect(mockLGService.getByGuid).toHaveBeenCalledTimes(1);
    expect(mockAppService.getForGovernmentByFileId).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.getForGovernment).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.verifyComplete).toHaveBeenCalledTimes(1);
    expect(mockAppService.submitToAlcs).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus.mock.calls[0][1]).toEqual(
      APPLICATION_STATUS.REFUSED_TO_FORWARD,
    );
  });

  it('should update the status, delete documents, and update the application for return', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission({
        statusCode: APPLICATION_STATUS.IN_REVIEW,
        documents: [
          new ApplicationDocument({
            type: DOCUMENT_TYPE.RESOLUTION_DOCUMENT,
          }),
          new ApplicationDocument({
            type: DOCUMENT_TYPE.CERTIFICATE_OF_TITLE,
          }),
        ],
      }),
    );
    mockAppService.updateStatus.mockResolvedValue({} as any);
    mockAppReviewService.getForGovernment.mockResolvedValue(applicationReview);
    mockAppReviewService.delete.mockResolvedValue();
    mockAppDocService.delete.mockResolvedValue({} as any);

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
    expect(mockAppService.getForGovernmentByFileId).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.getForGovernment).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.delete).toHaveBeenCalledTimes(1);
    expect(mockAppReviewService.delete).toHaveBeenCalledTimes(1);
    expect(mockAppService.updateStatus.mock.calls[0][1]).toEqual(
      APPLICATION_STATUS.INCOMPLETE,
    );
  });

  it('should throw an exception when trying to return an application not in review', async () => {
    mockLGService.getByGuid.mockResolvedValue(mockLG);
    mockAppService.getForGovernmentByFileId.mockResolvedValue(
      new ApplicationSubmission({
        statusCode: APPLICATION_STATUS.SUBMITTED_TO_ALC,
      }),
    );
    mockAppReviewService.getForGovernment.mockResolvedValue(applicationReview);

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
    expect(mockAppReviewService.getForGovernment).toHaveBeenCalledTimes(1);
  });
});

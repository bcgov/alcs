import { BaseServiceException } from '@app/common/exceptions/base.exception';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationLocalGovernment } from '../../alcs/application/application-code/application-local-government/application-local-government.entity';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { User } from '../../user/user.entity';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
} from '../application-proposal/application-document/application-document.entity';
import { ApplicationDocumentService } from '../application-proposal/application-document/application-document.service';
import {
  ApplicationProposalValidatorService,
  ValidatedApplication,
} from '../application-proposal/application-proposal-validator.service';
import { ApplicationProposal } from '../application-proposal/application-proposal.entity';
import { ApplicationProposalService } from '../application-proposal/application-proposal.service';
import { APPLICATION_STATUS } from '../application-proposal/application-status/application-status.dto';
import { ApplicationProposalReviewController } from './application-proposal-review.controller';
import { ApplicationProposalReviewDto } from './application-proposal-review.dto';
import { ApplicationProposalReview } from './application-proposal-review.entity';
import {
  ApplicationProposalReviewService,
  CompletedApplicationProposalReview,
} from './application-proposal-review.service';

describe('ApplicationProposalReviewController', () => {
  let controller: ApplicationProposalReviewController;
  let mockAppReviewService: DeepMocked<ApplicationProposalReviewService>;
  let mockAppService: DeepMocked<ApplicationProposalService>;
  let mockLGService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockAppValidatorService: DeepMocked<ApplicationProposalValidatorService>;

  const mockLG = new ApplicationLocalGovernment({
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
    mockAppService = createMock();
    mockLGService = createMock();
    mockAppDocService = createMock();
    mockAppValidatorService = createMock();

    applicationReview = new ApplicationProposalReview({
      applicationFileNumber: fileNumber,
    });

    mockAppReviewService.mapToDto.mockResolvedValue(
      {} as ApplicationProposalReviewDto,
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationProposalReviewController],
      providers: [
        {
          provide: ApplicationProposalReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: ApplicationProposalService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockLGService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: ApplicationProposalValidatorService,
          useValue: mockAppValidatorService,
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<ApplicationProposalReviewController>(
      ApplicationProposalReviewController,
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
    mockLGService.list.mockResolvedValue([
      new ApplicationLocalGovernment({
        bceidBusinessGuid: '',
        uuid: 'uuid',
        name: '',
        isFirstNation: false,
      }),
    ]);

    const reviewWithApp = new ApplicationProposalReview({
      ...applicationReview,
      application: new ApplicationProposal({
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
    mockLGService.list.mockResolvedValue([
      new ApplicationLocalGovernment({
        bceidBusinessGuid: '',
        uuid: 'uuid',
        name: '',
        isFirstNation: false,
      }),
    ]);

    const reviewWithApp = new ApplicationProposalReview({
      ...applicationReview,
      application: new ApplicationProposal({
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
      new ApplicationProposal(),
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
      new ApplicationProposal({
        statusCode: APPLICATION_STATUS.SUBMITTED_TO_ALC,
      }),
    );
    mockAppReviewService.verifyComplete.mockReturnValue(
      applicationReview as CompletedApplicationProposalReview,
    );
    mockAppReviewService.getForGovernment.mockResolvedValue(applicationReview);
    mockAppValidatorService.validateApplication.mockResolvedValue({
      application: new ApplicationProposal() as ValidatedApplication,
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
      new ApplicationProposal({ statusCode: APPLICATION_STATUS.IN_REVIEW }),
    );
    // mockAppService.submitToAlcs.mockResolvedValue({
    //   fileNumber: '',
    //   applicant: '',
    //   localGovernmentUuid: '',
    //   dateSubmittedToAlc: '',
    //   regionCode: '',
    //   typeCode: '',
    // });
    mockAppReviewService.verifyComplete.mockReturnValue({
      ...applicationReview,
      isAuthorized: true,
    } as CompletedApplicationProposalReview);
    mockAppReviewService.getForGovernment.mockResolvedValue(applicationReview);
    mockAppValidatorService.validateApplication.mockResolvedValue({
      application: new ApplicationProposal() as ValidatedApplication,
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
      new ApplicationProposal({ statusCode: APPLICATION_STATUS.IN_REVIEW }),
    );
    // mockAppService.submitToAlcs.mockResolvedValue({
    //   fileNumber: '',
    //   applicant: '',
    //   localGovernmentUuid: '',
    //   dateSubmittedToAlc: '',
    //   regionCode: '',
    //   typeCode: '',
    // });
    mockAppReviewService.verifyComplete.mockReturnValue({
      ...applicationReview,
      isAuthorized: false,
    } as CompletedApplicationProposalReview);
    mockAppReviewService.getForGovernment.mockResolvedValue(applicationReview);
    mockAppValidatorService.validateApplication.mockResolvedValue({
      application: new ApplicationProposal() as ValidatedApplication,
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
      new ApplicationProposal({
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
      new ApplicationProposal({
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

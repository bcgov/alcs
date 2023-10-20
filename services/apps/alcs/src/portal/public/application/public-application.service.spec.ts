import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationDecisionV2Service } from '../../../alcs/application-decision/application-decision-v2/application-decision/application-decision-v2.service';
import {
  ApplicationDocument,
  VISIBILITY_FLAG,
} from '../../../alcs/application/application-document/application-document.entity';
import { ApplicationDocumentService } from '../../../alcs/application/application-document/application-document.service';
import { ApplicationSubmissionToSubmissionStatus } from '../../../alcs/application/application-submission-status/submission-status.entity';
import { Application } from '../../../alcs/application/application.entity';
import { ApplicationService } from '../../../alcs/application/application.service';
import { ApplicationType } from '../../../alcs/code/application-code/application-type/application-type.entity';
import { PublicAutomapperProfile } from '../../../common/automapper/public.automapper.profile';
import { ApplicationSubmissionReview } from '../../application-submission-review/application-submission-review.entity';
import { ApplicationSubmissionReviewService } from '../../application-submission-review/application-submission-review.service';
import { ApplicationParcelService } from '../../application-submission/application-parcel/application-parcel.service';
import { ApplicationSubmission } from '../../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../../application-submission/application-submission.service';
import { PublicApplicationService } from './public-application.service';

describe('PublicApplicationService', () => {
  let service: PublicApplicationService;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockAppSubService: DeepMocked<ApplicationSubmissionService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;
  let mockAppReviewService: DeepMocked<ApplicationSubmissionReviewService>;
  let mockAppDecService: DeepMocked<ApplicationDecisionV2Service>;

  beforeEach(async () => {
    mockAppService = createMock();
    mockAppSubService = createMock();
    mockAppParcelService = createMock();
    mockAppDocService = createMock();
    mockAppReviewService = createMock();
    mockAppDecService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        PublicApplicationService,
        PublicAutomapperProfile,
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockAppParcelService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockAppDecService,
        },
      ],
    }).compile();

    service = module.get<PublicApplicationService>(PublicApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('load an Application and its related data for get application', async () => {
    mockAppService.get.mockResolvedValue(
      new Application({
        dateReceivedAllItems: new Date(),
        type: new ApplicationType(),
      }),
    );
    mockAppSubService.getOrFailByFileNumber.mockResolvedValue(
      new ApplicationSubmission({
        get status(): ApplicationSubmissionToSubmissionStatus {
          return new ApplicationSubmissionToSubmissionStatus();
        },
      }),
    );
    mockAppParcelService.fetchByApplicationFileId.mockResolvedValue([]);
    mockAppDocService.list.mockResolvedValue([]);
    mockAppReviewService.getForPublicReview.mockResolvedValue(
      new ApplicationSubmissionReview(),
    );
    mockAppDecService.getForPortal.mockResolvedValue([]);

    const fileId = 'file-id';
    await service.getPublicData(fileId);

    expect(mockAppService.get).toHaveBeenCalledTimes(1);
    expect(mockAppSubService.getOrFailByFileNumber).toHaveBeenCalledTimes(1);
    expect(mockAppParcelService.fetchByApplicationFileId).toHaveBeenCalledTimes(
      1,
    );
    expect(mockAppDocService.list).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.list).toHaveBeenCalledWith(fileId, [
      VISIBILITY_FLAG.PUBLIC,
    ]);
    expect(mockAppReviewService.getForPublicReview).toHaveBeenCalledTimes(1);
    expect(mockAppDecService.getForPortal).toHaveBeenCalledTimes(1);
  });

  it('should call through to document service for getting files', async () => {
    const mockDoc = new ApplicationDocument({
      visibilityFlags: [VISIBILITY_FLAG.PUBLIC],
    });
    mockAppDocService.get.mockResolvedValue(mockDoc);
    mockAppDocService.getInlineUrl.mockResolvedValue('');

    const documentUuid = 'document-uuid';
    await service.getInlineUrl(documentUuid);

    expect(mockAppDocService.get).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.getInlineUrl).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.getInlineUrl).toHaveBeenCalledWith(mockDoc);
  });

  it('should throw an exception when the document is not public', async () => {
    const mockDoc = new ApplicationDocument({
      visibilityFlags: [VISIBILITY_FLAG.APPLICANT],
    });
    mockAppDocService.get.mockResolvedValue(mockDoc);

    const documentUuid = 'document-uuid';
    const promise = service.getInlineUrl(documentUuid);

    await expect(promise).rejects.toMatchObject(
      new ServiceNotFoundException('Failed to find document'),
    );

    expect(mockAppDocService.get).toHaveBeenCalledTimes(1);
    expect(mockAppDocService.getInlineUrl).toHaveBeenCalledTimes(0);
  });
});

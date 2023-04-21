import { CdogsService } from '@app/common/cdogs/cdogs.service';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationLocalGovernmentService } from '../../alcs/application/application-code/application-local-government/application-local-government.service';
import { ApplicationDocumentService } from '../../alcs/application/application-document/application-document.service';
import { Application } from '../../alcs/application/application.entity';
import { ApplicationService } from '../../alcs/application/application.service';
import { ApplicationSubmissionReviewProfile } from '../../common/automapper/application-submission-review.automapper.profile';
import { ApplicationSubmissionProfile } from '../../common/automapper/application-submission.automapper.profile';
import { User } from '../../user/user.entity';
import { ApplicationSubmissionReview } from '../application-submission-review/application-submission-review.entity';
import { ApplicationSubmissionReviewService } from '../application-submission-review/application-submission-review.service';
import { ApplicationSubmission } from '../application-submission/application-submission.entity';
import { ApplicationSubmissionService } from '../application-submission/application-submission.service';
import { GenerateReviewDocumentService } from './generate-review-document.service';

describe('GenerateReviewDocumentService', () => {
  let service: GenerateReviewDocumentService;
  let mockCdogsService: DeepMocked<CdogsService>;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockApplicationLocalGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockSubmissionReviewService: DeepMocked<ApplicationSubmissionReviewService>;

  beforeEach(async () => {
    mockCdogsService = createMock();
    mockApplicationSubmissionService = createMock();
    mockApplicationLocalGovernmentService = createMock();
    mockApplicationService = createMock();
    mockApplicationDocumentService = createMock();
    mockSubmissionReviewService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        GenerateReviewDocumentService,
        ApplicationSubmissionReviewProfile,
        { provide: CdogsService, useValue: mockCdogsService },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockApplicationLocalGovernmentService,
        },
        { provide: ApplicationService, useValue: mockApplicationService },
        {
          provide: ApplicationDocumentService,
          useValue: mockApplicationDocumentService,
        },
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockSubmissionReviewService,
        },
      ],
    }).compile();

    service = module.get(GenerateReviewDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call cdogs service to generate pdf', async () => {
    mockCdogsService.generateDocument.mockResolvedValue({} as any);

    mockApplicationSubmissionService.verifyAccessByFileId.mockResolvedValue({
      fileNumber: 'fake',
      localGovernmentUuid: 'fake-lg',
      typeCode: 'NFUP',
    } as ApplicationSubmission);

    mockSubmissionReviewService.getByFileNumber.mockResolvedValue(
      new ApplicationSubmissionReview(),
    );

    mockApplicationDocumentService.list.mockResolvedValue([]);
    mockApplicationService.getOrFail.mockResolvedValue({
      type: { portalLabel: 'fake-label' },
      localGovernmentUuid: 'cats',
    } as Application);
    mockApplicationLocalGovernmentService.getByUuid.mockResolvedValue(null);
    const userEntity = new User({
      name: 'Bruce Wayne',
    });

    const res = await service.generate('fake', userEntity);

    expect(mockCdogsService.generateDocument).toBeCalledTimes(1);
    expect(mockApplicationLocalGovernmentService.getByUuid).toBeCalledTimes(1);
    expect(res).toBeDefined();
  });
});

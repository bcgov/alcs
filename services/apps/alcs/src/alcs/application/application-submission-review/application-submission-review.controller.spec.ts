import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { ApplicationSubmissionReviewDto } from '../../../portal/application-submission-review/application-submission-review.dto';
import { ApplicationSubmissionReview } from '../../../portal/application-submission-review/application-submission-review.entity';
import { ApplicationSubmissionReviewController } from './application-submission-review.controller';
import { ApplicationSubmissionReviewService } from './application-submission-review.service';

describe('ApplicationSubmissionReviewController', () => {
  let controller: ApplicationSubmissionReviewController;
  let mockApplicationSubmissionReviewService: DeepMocked<ApplicationSubmissionReviewService>;

  beforeEach(async () => {
    mockApplicationSubmissionReviewService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationSubmissionReviewController],
      providers: [
        {
          provide: ApplicationSubmissionReviewService,
          useValue: mockApplicationSubmissionReviewService,
        },
        {
          provide: ClsService,
          useValue: {},
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

  it('should call applicationSubmissionService to get Application Submission', async () => {
    const fakeFileNumber = 'fake';

    mockApplicationSubmissionReviewService.get.mockResolvedValue(
      {} as ApplicationSubmissionReview,
    );
    mockApplicationSubmissionReviewService.mapToDto.mockResolvedValue(
      createMock<ApplicationSubmissionReviewDto>(),
    );

    const result = await controller.get(fakeFileNumber);

    expect(mockApplicationSubmissionReviewService.get).toBeCalledTimes(1);
    expect(mockApplicationSubmissionReviewService.mapToDto).toBeCalledTimes(1);
    expect(result).toBeDefined();
  });
});

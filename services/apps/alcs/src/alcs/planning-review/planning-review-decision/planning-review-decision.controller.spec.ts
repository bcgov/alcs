import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { mockKeyCloakProviders } from '../../../../test/mocks/mockTypes';
import { PlanningReviewDecisionProfile } from '../../../common/automapper/planning-review-decision.automapper.profile';
import { PlanningReviewProfile } from '../../../common/automapper/planning-review.automapper.profile';
import { UserProfile } from '../../../common/automapper/user.automapper.profile';
import { PlanningReview } from '../planning-review.entity';
import { PlanningReviewDecisionOutcomeCode } from './planning-review-decision-outcome.entity';
import { PlanningReviewDecisionController } from './planning-review-decision.controller';
import {
  CreatePlanningReviewDecisionDto,
  UpdatePlanningReviewDecisionDto,
} from './planning-review-decision.dto';
import { PlanningReviewDecision } from './planning-review-decision.entity';
import { PlanningReviewDecisionService } from './planning-review-decision.service';

describe('PlanningReviewDecisionController', () => {
  let controller: PlanningReviewDecisionController;
  let mockDecisionService: DeepMocked<PlanningReviewDecisionService>;

  let mockPlanningReview;
  let mockDecision;

  beforeEach(async () => {
    mockDecisionService = createMock();

    mockPlanningReview = new PlanningReview();
    mockDecision = new PlanningReviewDecision({
      planningReview: mockPlanningReview,
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [PlanningReviewDecisionController],
      providers: [
        PlanningReviewProfile,
        PlanningReviewDecisionProfile,
        UserProfile,
        {
          provide: PlanningReviewDecisionService,
          useValue: mockDecisionService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<PlanningReviewDecisionController>(
      PlanningReviewDecisionController,
    );

    mockDecisionService.fetchCodes.mockResolvedValue({
      outcomes: [
        {
          code: 'decision-code',
          label: 'decision-label',
        } as PlanningReviewDecisionOutcomeCode,
      ],
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all for planning review', async () => {
    mockDecisionService.getByFileNumber.mockResolvedValue([mockDecision]);

    const result = await controller.getByFileNumber('fake-number');

    expect(mockDecisionService.getByFileNumber).toBeCalledTimes(1);
    expect(result[0].uuid).toStrictEqual(mockDecision.uuid);
  });

  it('should get a specific decision', async () => {
    mockDecisionService.get.mockResolvedValue(mockDecision);
    const result = await controller.get('fake-uuid');

    expect(mockDecisionService.get).toBeCalledTimes(1);
    expect(result.uuid).toStrictEqual(mockDecision.uuid);
  });

  it('should call through for deletion', async () => {
    mockDecisionService.delete.mockResolvedValue({} as any);

    await controller.delete('fake-uuid');

    expect(mockDecisionService.delete).toBeCalledTimes(1);
    expect(mockDecisionService.delete).toBeCalledWith('fake-uuid');
  });

  it('should create the decision if planning review exists', async () => {
    mockDecisionService.create.mockResolvedValue(mockDecision);

    const decisionToCreate: CreatePlanningReviewDecisionDto = {
      planningReviewFileNumber: mockPlanningReview.fileNumber,
    };

    await controller.create(decisionToCreate);

    expect(mockDecisionService.create).toBeCalledTimes(1);
    expect(mockDecisionService.create).toBeCalledWith({
      planningReviewFileNumber: mockPlanningReview.fileNumber,
    });
  });

  it('should update the decision', async () => {
    mockDecisionService.update.mockResolvedValue(mockDecision);

    const updates: UpdatePlanningReviewDecisionDto = {
      outcomeCode: 'New Outcome',
      date: new Date(2022, 2, 2, 2, 2, 2, 2).valueOf(),
      isDraft: true,
    };

    await controller.update('fake-uuid', updates);

    expect(mockDecisionService.update).toBeCalledTimes(1);
    expect(mockDecisionService.update).toBeCalledWith('fake-uuid', {
      outcomeCode: 'New Outcome',
      date: updates.date,
      isDraft: true,
    });
  });

  it('should call through for attaching the document', async () => {
    mockDecisionService.attachDocument.mockResolvedValue({} as any);
    await controller.attachDocument('fake-uuid', {
      isMultipart: () => true,
      body: {
        file: {},
      },
      user: {
        entity: {},
      },
    });

    expect(mockDecisionService.attachDocument).toBeCalledTimes(1);
  });

  it('should throw an exception if there is no file for file upload', async () => {
    mockDecisionService.attachDocument.mockResolvedValue({} as any);
    const promise = controller.attachDocument('fake-uuid', {
      file: () => ({}),
      isMultipart: () => false,
      user: {
        entity: {},
      },
    });

    await expect(promise).rejects.toMatchObject(
      new Error('Request is not multipart'),
    );
  });

  it('should call through for getting download url', async () => {
    const fakeUrl = 'fake-url';
    mockDecisionService.getDownloadUrl.mockResolvedValue(fakeUrl);
    const res = await controller.getDownloadUrl('fake-uuid', 'document-uuid');

    expect(mockDecisionService.getDownloadUrl).toBeCalledTimes(1);
    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for updating the file', async () => {
    mockDecisionService.updateDocument.mockResolvedValue({} as any);
    await controller.updateDocument('fake-uuid', 'document-uuid', {
      fileName: '',
    });

    expect(mockDecisionService.updateDocument).toBeCalledTimes(1);
  });

  it('should call through for getting open url', async () => {
    const fakeUrl = 'fake-url';
    mockDecisionService.getDownloadUrl.mockResolvedValue(fakeUrl);
    const res = await controller.getOpenUrl('fake-uuid', 'document-uuid');

    expect(mockDecisionService.getDownloadUrl).toBeCalledTimes(1);
    expect(res.url).toEqual(fakeUrl);
  });

  it('should call through for document deletion', async () => {
    mockDecisionService.deleteDocument.mockResolvedValue({} as any);
    await controller.deleteDocument('fake-uuid', 'document-uuid');

    expect(mockDecisionService.deleteDocument).toBeCalledTimes(1);
  });

  it('should call through for resolution number generation', async () => {
    mockDecisionService.generateResolutionNumber.mockResolvedValue(1);
    await controller.getNextAvailableResolutionNumber(2023);

    expect(mockDecisionService.generateResolutionNumber).toBeCalledTimes(1);
    expect(mockDecisionService.generateResolutionNumber).toBeCalledWith(2023);
  });
});

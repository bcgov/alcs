import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApplicationAmendmentService } from '../application-amendment/application-amendment.service';
import { ApplicationReconsiderationService } from '../application-reconsideration/application-reconsideration.service';
import { ApplicationTimeTrackingService } from '../application/application-time-tracking.service';
import { ApplicationService } from '../application/application.service';
import { CardSubtaskService } from '../card/card-subtask/card-subtask.service';
import { CodeService } from '../code/code.service';
import { ApplicationSubtaskProfile } from '../common/automapper/application-subtask.automapper.profile';
import { ApplicationProfile } from '../common/automapper/application.automapper.profile';
import { CardProfile } from '../common/automapper/card.automapper.profile';
import { UserProfile } from '../common/automapper/user.automapper.profile';
import {
  initApplicationAmendementMockEntity,
  initApplicationMockEntity,
  initApplicationReconsiderationMockEntity,
  initCardMockEntity,
} from '../common/utils/test-helpers/mockEntities';
import { mockKeyCloakProviders } from '../common/utils/test-helpers/mockTypes';
import { PlanningReview } from '../planning-review/planning-review.entity';
import { PlanningReviewService } from '../planning-review/planning-review.service';
import { HomeController } from './home.controller';

describe('HomeController', () => {
  let controller: HomeController;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationSubtaskService: DeepMocked<CardSubtaskService>;
  let mockApplicationReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockApplicationAmendmentService: DeepMocked<ApplicationAmendmentService>;
  let mockPlanningReviewService: DeepMocked<PlanningReviewService>;
  let mockApplicationTimeTrackingService: DeepMocked<ApplicationTimeTrackingService>;

  beforeEach(async () => {
    mockApplicationService = createMock<ApplicationService>();
    mockApplicationSubtaskService = createMock<CardSubtaskService>();
    mockApplicationReconsiderationService =
      createMock<ApplicationReconsiderationService>();
    mockPlanningReviewService = createMock<PlanningReviewService>();
    mockApplicationTimeTrackingService =
      createMock<ApplicationTimeTrackingService>();
    mockApplicationAmendmentService = createMock<ApplicationAmendmentService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      controllers: [HomeController],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: CardSubtaskService,
          useValue: mockApplicationSubtaskService,
        },
        {
          provide: ClsService,
          useValue: {},
        },
        {
          provide: CodeService,
          useValue: {},
        },
        {
          provide: ApplicationReconsiderationService,
          useValue: mockApplicationReconsiderationService,
        },
        {
          provide: ApplicationAmendmentService,
          useValue: mockApplicationAmendmentService,
        },
        {
          provide: ApplicationTimeTrackingService,
          useValue: mockApplicationTimeTrackingService,
        },
        {
          provide: PlanningReviewService,
          useValue: mockPlanningReviewService,
        },
        ApplicationProfile,
        ApplicationSubtaskProfile,
        UserProfile,
        CardProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);

    mockApplicationService.getAll.mockResolvedValue([]);
    mockApplicationService.mapToDtos.mockResolvedValue([]);
    mockApplicationReconsiderationService.getBy.mockResolvedValue([]);
    mockApplicationReconsiderationService.mapToDtos.mockResolvedValue([]);
    mockApplicationAmendmentService.getBy.mockResolvedValue([]);
    mockApplicationAmendmentService.mapToDtos.mockResolvedValue([]);
    mockPlanningReviewService.getBy.mockResolvedValue([]);
    mockPlanningReviewService.mapToDtos.mockResolvedValue([]);

    mockApplicationTimeTrackingService.fetchActiveTimes.mockResolvedValue(
      new Map(),
    );
    mockApplicationTimeTrackingService.getPausedStatus.mockResolvedValue(
      new Map(),
    );

    mockApplicationReconsiderationService.getWithIncompleteSubtaskByType.mockResolvedValue(
      [],
    );
    mockPlanningReviewService.getWithIncompleteSubtaskByType.mockResolvedValue(
      [],
    );
    mockApplicationAmendmentService.getWithIncompleteSubtaskByType.mockResolvedValue(
      [],
    );
    mockApplicationService.getWithIncompleteSubtaskByType.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Assigned To Me', () => {
    it('should call ApplicationService with the correct filter for assigned', async () => {
      const userId = 'fake-user-id';
      await controller.getAssignedToMe({
        user: {
          entity: {
            uuid: userId,
          },
        },
      });
      const filterCondition = {
        card: {
          assigneeUuid: userId,
        },
      };
      expect(mockApplicationService.getAll).toHaveBeenCalledTimes(1);
      expect(mockApplicationService.getAll.mock.calls[0][0]).toEqual(
        filterCondition,
      );

      expect(mockApplicationReconsiderationService.getBy).toHaveBeenCalledTimes(
        1,
      );
      expect(
        mockApplicationReconsiderationService.getBy.mock.calls[0][0],
      ).toEqual(filterCondition);

      expect(mockPlanningReviewService.getBy).toHaveBeenCalledTimes(1);
      expect(mockPlanningReviewService.getBy.mock.calls[0][0]).toEqual(
        filterCondition,
      );
    });
  });

  describe('Subtasks', () => {
    it('should call ApplicationService and map an Application', async () => {
      const mockApplication = initApplicationMockEntity();
      const activeDays = 5;
      mockApplicationService.getWithIncompleteSubtaskByType.mockResolvedValue([
        mockApplication,
      ]);
      mockApplicationTimeTrackingService.getPausedStatus.mockResolvedValue(
        new Map([[mockApplication.uuid, true]]),
      );
      mockApplicationTimeTrackingService.fetchActiveTimes.mockResolvedValue(
        new Map([
          [
            mockApplication.uuid,
            {
              activeDays,
              pausedDays: 0,
            },
          ],
        ]),
      );

      const res = await controller.getIncompleteSubtasksByType('GIS');

      expect(res.length).toEqual(1);
      expect(
        mockApplicationService.getWithIncompleteSubtaskByType,
      ).toBeCalledTimes(1);
      expect(res[0].title).toContain(mockApplication.fileNumber);
      expect(res[0].title).toContain(mockApplication.applicant);
      expect(res[0].activeDays).toBe(activeDays);
      expect(res[0].paused).toBeTruthy();
    });

    it('should call Reconsideration Service and map it', async () => {
      const mockReconsideration = initApplicationReconsiderationMockEntity();
      mockApplicationReconsiderationService.getWithIncompleteSubtaskByType.mockResolvedValue(
        [mockReconsideration],
      );

      const res = await controller.getIncompleteSubtasksByType('GIS');

      expect(res.length).toEqual(1);
      expect(
        mockApplicationReconsiderationService.getWithIncompleteSubtaskByType,
      ).toBeCalledTimes(1);
      expect(res[0].title).toContain(
        mockReconsideration.application.fileNumber,
      );
      expect(res[0].title).toContain(mockReconsideration.application.applicant);
      expect(res[0].activeDays).toBeUndefined();
      expect(res[0].paused).toBeFalsy();
    });

    it('should call Reconsideration Service and map it', async () => {
      const mockPlanningReview = {
        type: 'fake-type',
        fileNumber: 'fileNumber',
        card: initCardMockEntity('222'),
      } as PlanningReview;
      mockPlanningReviewService.getWithIncompleteSubtaskByType.mockResolvedValue(
        [mockPlanningReview],
      );

      const res = await controller.getIncompleteSubtasksByType('GIS');

      expect(res.length).toEqual(1);
      expect(
        mockPlanningReviewService.getWithIncompleteSubtaskByType,
      ).toHaveBeenCalledTimes(1);

      expect(res[0].title).toContain(mockPlanningReview.fileNumber);
      expect(res[0].title).toContain(mockPlanningReview.type);
      expect(res[0].activeDays).toBeUndefined();
      expect(res[0].paused).toBeFalsy();
    });

    it('should call Amendment Service and map it', async () => {
      const mockAmendment = initApplicationAmendementMockEntity();
      mockApplicationAmendmentService.getWithIncompleteSubtaskByType.mockResolvedValue(
        [mockAmendment],
      );

      const res = await controller.getIncompleteSubtasksByType('GIS');

      expect(res.length).toEqual(1);
      expect(
        mockPlanningReviewService.getWithIncompleteSubtaskByType,
      ).toHaveBeenCalledTimes(1);

      expect(res[0].title).toContain(mockAmendment.application.fileNumber);
      expect(res[0].title).toContain(mockAmendment.application.applicant);
      expect(res[0].activeDays).toBeUndefined();
      expect(res[0].paused).toBeFalsy();
    });
  });
});

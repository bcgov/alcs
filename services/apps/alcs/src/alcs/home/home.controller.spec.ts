import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { classes } from 'automapper-classes';
import { AutomapperModule } from 'automapper-nestjs';
import { ClsService } from 'nestjs-cls';
import { In, Not } from 'typeorm';
import {
  initApplicationMockEntity,
  initApplicationModificationMockEntity,
  initApplicationReconsiderationMockEntity,
  initCardMockEntity,
} from '../../../test/mocks/mockEntities';
import { mockKeyCloakProviders } from '../../../test/mocks/mockTypes';
import { ApplicationSubtaskProfile } from '../../common/automapper/application-subtask.automapper.profile';
import { ApplicationProfile } from '../../common/automapper/application.automapper.profile';
import { CardProfile } from '../../common/automapper/card.automapper.profile';
import { InquiryProfile } from '../../common/automapper/inquiry.automapper.profile';
import { NotificationProfile } from '../../common/automapper/notification.automapper.profile';
import { UserProfile } from '../../common/automapper/user.automapper.profile';
import { ApplicationModificationService } from '../application-decision/application-modification/application-modification.service';
import { ApplicationReconsiderationService } from '../application-decision/application-reconsideration/application-reconsideration.service';
import { ApplicationTimeTrackingService } from '../application/application-time-tracking.service';
import { ApplicationService } from '../application/application.service';
import { CARD_STATUS } from '../card/card-status/card-status.entity';
import { CARD_SUBTASK_TYPE } from '../card/card-subtask/card-subtask.dto';
import { CardSubtaskService } from '../card/card-subtask/card-subtask.service';
import { CodeService } from '../code/code.service';
import { Inquiry } from '../inquiry/inquiry.entity';
import { InquiryService } from '../inquiry/inquiry.service';
import { NoticeOfIntentModification } from '../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.entity';
import { NoticeOfIntentModificationService } from '../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntent } from '../notice-of-intent/notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent/notice-of-intent.service';
import { Notification } from '../notification/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { PlanningReferralService } from '../planning-review/planning-referral/planning-referral.service';
import { HomeController } from './home.controller';

describe('HomeController', () => {
  let controller: HomeController;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationSubtaskService: DeepMocked<CardSubtaskService>;
  let mockApplicationReconsiderationService: DeepMocked<ApplicationReconsiderationService>;
  let mockApplicationModificationService: DeepMocked<ApplicationModificationService>;
  let mockApplicationTimeTrackingService: DeepMocked<ApplicationTimeTrackingService>;
  let mockNoticeOfIntentService: DeepMocked<NoticeOfIntentService>;
  let mockNoticeOfIntentModificationService: DeepMocked<NoticeOfIntentModificationService>;
  let mockNotificationService: DeepMocked<NotificationService>;
  let mockPlanningReferralService: DeepMocked<PlanningReferralService>;
  let mockInquiryService: DeepMocked<InquiryService>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockApplicationSubtaskService = createMock();
    mockApplicationReconsiderationService = createMock();
    mockApplicationTimeTrackingService = createMock();
    mockApplicationModificationService = createMock();
    mockNoticeOfIntentService = createMock();
    mockNoticeOfIntentModificationService = createMock();
    mockNotificationService = createMock();
    mockPlanningReferralService = createMock();
    mockInquiryService = createMock();

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
          provide: ApplicationModificationService,
          useValue: mockApplicationModificationService,
        },
        {
          provide: ApplicationTimeTrackingService,
          useValue: mockApplicationTimeTrackingService,
        },
        {
          provide: NoticeOfIntentService,
          useValue: mockNoticeOfIntentService,
        },
        {
          provide: NoticeOfIntentModificationService,
          useValue: mockNoticeOfIntentModificationService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: PlanningReferralService,
          useValue: mockPlanningReferralService,
        },
        {
          provide: InquiryService,
          useValue: mockInquiryService,
        },
        ApplicationProfile,
        ApplicationSubtaskProfile,
        UserProfile,
        CardProfile,
        NotificationProfile,
        InquiryProfile,
        ...mockKeyCloakProviders,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);

    mockApplicationService.getMany.mockResolvedValue([]);
    mockApplicationService.mapToDtos.mockResolvedValue([]);
    mockApplicationReconsiderationService.getBy.mockResolvedValue([]);
    mockApplicationReconsiderationService.mapToDtos.mockResolvedValue([]);
    mockApplicationModificationService.getBy.mockResolvedValue([]);
    mockApplicationModificationService.mapToDtos.mockResolvedValue([]);
    mockNoticeOfIntentService.getBy.mockResolvedValue([]);
    mockNoticeOfIntentService.mapToDtos.mockResolvedValue([]);
    mockNoticeOfIntentModificationService.getBy.mockResolvedValue([]);
    mockNoticeOfIntentModificationService.mapToDtos.mockResolvedValue([]);
    mockNotificationService.getBy.mockResolvedValue([]);
    mockNotificationService.mapToDtos.mockResolvedValue([]);
    mockPlanningReferralService.getBy.mockResolvedValue([]);
    mockPlanningReferralService.mapToDtos.mockResolvedValue([]);
    mockInquiryService.getBy.mockResolvedValue([]);
    mockInquiryService.mapToDtos.mockResolvedValue([]);

    mockNoticeOfIntentService.getTimes.mockResolvedValue(new Map());
    mockApplicationTimeTrackingService.fetchActiveTimes.mockResolvedValue(
      new Map(),
    );
    mockApplicationTimeTrackingService.getPausedStatus.mockResolvedValue(
      new Map(),
    );

    mockApplicationReconsiderationService.getWithIncompleteSubtaskByType.mockResolvedValue(
      [],
    );
    mockApplicationModificationService.getWithIncompleteSubtaskByType.mockResolvedValue(
      [],
    );
    mockApplicationService.getWithIncompleteSubtaskByType.mockResolvedValue([]);
    mockNoticeOfIntentService.getWithIncompleteSubtaskByType.mockResolvedValue(
      [],
    );
    mockNoticeOfIntentModificationService.getWithIncompleteSubtaskByType.mockResolvedValue(
      [],
    );
    mockNotificationService.getWithIncompleteSubtaskByType.mockResolvedValue(
      [],
    );
    mockPlanningReferralService.getWithIncompleteSubtaskByType.mockResolvedValue(
      [],
    );
    mockInquiryService.getWithIncompleteSubtaskByType.mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Assigned To Me', () => {
    it('should call Application, NOI, Notification services with the correct filter for assigned', async () => {
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
          status: {
            code: Not(
              In([CARD_STATUS.CANCELLED, CARD_STATUS.DECISION_RELEASED]),
            ),
          },
        },
      };
      expect(mockApplicationService.getMany).toHaveBeenCalledTimes(1);
      expect(mockApplicationService.getMany.mock.calls[0][0]).toEqual(
        filterCondition,
      );

      expect(mockApplicationReconsiderationService.getBy).toHaveBeenCalledTimes(
        1,
      );
      expect(
        mockApplicationReconsiderationService.getBy.mock.calls[0][0],
      ).toEqual(filterCondition);

      expect(mockNoticeOfIntentService.getBy).toHaveBeenCalledTimes(1);
      expect(mockNoticeOfIntentService.getBy.mock.calls[0][0]).toEqual(
        filterCondition,
      );

      expect(mockNoticeOfIntentModificationService.getBy).toHaveBeenCalledTimes(
        1,
      );
      expect(
        mockNoticeOfIntentModificationService.getBy.mock.calls[0][0],
      ).toEqual(filterCondition);

      expect(mockNotificationService.getBy).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.getBy.mock.calls[0][0]).toEqual(
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

      const res = await controller.getIncompleteSubtasksByType(
        CARD_SUBTASK_TYPE.GIS,
      );

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

      const res = await controller.getIncompleteSubtasksByType(
        CARD_SUBTASK_TYPE.GIS,
      );

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

    // TODO: Fix when finishing planning reviews
    // it('should call Planning Referral Service and map it', async () => {
    //   const mockPlanningReview = {
    //     type: 'fake-type',
    //     fileNumber: 'fileNumber',
    //     card: initCardMockEntity('222'),
    //   } as PlanningReview;
    //   mockPlanningReviewService.getWithIncompleteSubtaskByType.mockResolvedValue(
    //     [mockPlanningReview],
    //   );
    //
    //   const res = await controller.getIncompleteSubtasksByType(
    //     CARD_SUBTASK_TYPE.GIS,
    //   );
    //
    //   expect(res.length).toEqual(1);
    //   expect(
    //     mockPlanningReviewService.getWithIncompleteSubtaskByType,
    //   ).toHaveBeenCalledTimes(1);
    //
    //   expect(res[0].title).toContain(mockPlanningReview.fileNumber);
    //   expect(res[0].title).toContain(mockPlanningReview.type);
    //   expect(res[0].activeDays).toBeUndefined();
    //   expect(res[0].paused).toBeFalsy();
    // });

    it('should call Modification Service and map it', async () => {
      const mockModification = initApplicationModificationMockEntity();
      mockApplicationModificationService.getWithIncompleteSubtaskByType.mockResolvedValue(
        [mockModification],
      );

      const res = await controller.getIncompleteSubtasksByType(
        CARD_SUBTASK_TYPE.GIS,
      );

      expect(res.length).toEqual(1);
      expect(
        mockApplicationModificationService.getWithIncompleteSubtaskByType,
      ).toHaveBeenCalledTimes(1);

      expect(res[0].title).toContain(mockModification.application.fileNumber);
      expect(res[0].title).toContain(mockModification.application.applicant);
      expect(res[0].activeDays).toBeUndefined();
      expect(res[0].paused).toBeFalsy();
    });

    it('should call NOI Service and map it', async () => {
      const activeDays = 5;
      const mockNoi = new NoticeOfIntent({
        applicant: 'fake-applicant',
        fileNumber: 'fileNumber',
        card: initCardMockEntity('222'),
      });
      mockNoticeOfIntentService.getWithIncompleteSubtaskByType.mockResolvedValue(
        [mockNoi],
      );
      mockNoticeOfIntentService.getTimes.mockResolvedValue(
        new Map([
          [
            mockNoi.uuid,
            {
              activeDays,
              pausedDays: null,
            },
          ],
        ]),
      );

      const res = await controller.getIncompleteSubtasksByType(
        CARD_SUBTASK_TYPE.PEER_REVIEW,
      );

      expect(res.length).toEqual(1);
      expect(
        mockNoticeOfIntentService.getWithIncompleteSubtaskByType,
      ).toHaveBeenCalledTimes(1);

      expect(res[0].title).toContain(mockNoi.fileNumber);
      expect(res[0].title).toContain(mockNoi.applicant);
      expect(res[0].activeDays).toBe(activeDays);
    });

    it('should call NOI Modification Service and map it', async () => {
      const mockNoiModification = new NoticeOfIntentModification({
        noticeOfIntent: new NoticeOfIntent({
          applicant: 'fake-applicant',
          fileNumber: 'fileNumber',
        }),
        card: initCardMockEntity('222'),
      });
      mockNoticeOfIntentModificationService.getWithIncompleteSubtaskByType.mockResolvedValue(
        [mockNoiModification],
      );

      const res = await controller.getIncompleteSubtasksByType(
        CARD_SUBTASK_TYPE.PEER_REVIEW,
      );

      expect(res.length).toEqual(1);
      expect(
        mockNoticeOfIntentModificationService.getWithIncompleteSubtaskByType,
      ).toHaveBeenCalledTimes(1);

      expect(res[0].title).toContain(
        mockNoiModification.noticeOfIntent.fileNumber,
      );
      expect(res[0].title).toContain(
        mockNoiModification.noticeOfIntent.applicant,
      );
    });

    it('should call Notification Service and map it', async () => {
      const mockNotification = new Notification({
        applicant: 'fake-applicant',
        fileNumber: 'fileNumber',
        card: initCardMockEntity('222'),
      });
      mockNotificationService.getWithIncompleteSubtaskByType.mockResolvedValue([
        mockNotification,
      ]);

      const res = await controller.getIncompleteSubtasksByType(
        CARD_SUBTASK_TYPE.PEER_REVIEW,
      );

      expect(res.length).toEqual(1);
      expect(
        mockNotificationService.getWithIncompleteSubtaskByType,
      ).toHaveBeenCalledTimes(1);

      expect(res[0].title).toContain(mockNotification.fileNumber);
      expect(res[0].title).toContain(mockNotification.applicant);
    });

    it('should call Inquiry Service and map it', async () => {
      const mockInquiry = new Inquiry({
        fileNumber: 'fileNumber',
        card: initCardMockEntity('222'),
        inquirerLastName: 'lastName',
      });
      mockInquiryService.getWithIncompleteSubtaskByType.mockResolvedValue([
        mockInquiry,
      ]);

      const res = await controller.getIncompleteSubtasksByType(
        CARD_SUBTASK_TYPE.PEER_REVIEW,
      );

      expect(res.length).toEqual(1);
      expect(
        mockInquiryService.getWithIncompleteSubtaskByType,
      ).toHaveBeenCalledTimes(1);

      expect(res[0].title).toContain(mockInquiry.fileNumber);
      expect(res[0].title).toContain(mockInquiry.inquirerLastName);
    });
  });
});

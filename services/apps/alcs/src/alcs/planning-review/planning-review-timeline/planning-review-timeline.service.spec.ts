import { createMock, DeepMocked } from '@golevelup/nestjs-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { PlanningReferral } from '../planning-referral/planning-referral.entity';
import { PlanningReviewDecision } from '../planning-review-decision/planning-review-decision.entity';
import { PlanningReviewDecisionService } from '../planning-review-decision/planning-review-decision.service';
import { PlanningReviewMeetingType } from '../planning-review-meeting/planning-review-meeting-type.entity';
import { PlanningReviewMeeting } from '../planning-review-meeting/planning-review-meeting.entity';
import { PlanningReviewMeetingService } from '../planning-review-meeting/planning-review-meeting.service';
import { PlanningReview } from '../planning-review.entity';
import { PlanningReviewService } from '../planning-review.service';
import { PlanningReviewTimelineService } from './planning-review-timeline.service';

describe('PlanningReviewTimelineService', () => {
  let service: PlanningReviewTimelineService;

  let mockPlanningReviewDecisionService: DeepMocked<PlanningReviewDecisionService>;
  let mockPlanningReviewService: DeepMocked<PlanningReviewService>;
  let mockPlanningReviewMeetingService: DeepMocked<PlanningReviewMeetingService>;

  beforeEach(async () => {
    mockPlanningReviewDecisionService = createMock();
    mockPlanningReviewService = createMock();
    mockPlanningReviewMeetingService = createMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PlanningReviewDecisionService,
          useValue: mockPlanningReviewDecisionService,
        },
        {
          provide: PlanningReviewService,
          useValue: mockPlanningReviewService,
        },
        {
          provide: PlanningReviewMeetingService,
          useValue: mockPlanningReviewMeetingService,
        },
        PlanningReviewTimelineService,
      ],
    }).compile();

    mockPlanningReviewService.getDetailedReview.mockResolvedValue(
      new PlanningReview({
        referrals: [],
      }),
    );
    mockPlanningReviewDecisionService.getByFileNumber.mockResolvedValue([]);
    mockPlanningReviewMeetingService.getByPlanningReview.mockResolvedValue([]);

    service = module.get<PlanningReviewTimelineService>(
      PlanningReviewTimelineService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return nothing for empty PR', async () => {
    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
  });

  it('should map Referral events in the correct order', async () => {
    const sameDate = new Date();

    mockPlanningReviewService.getDetailedReview.mockResolvedValue(
      new PlanningReview({
        referrals: [
          new PlanningReferral({
            auditCreatedAt: sameDate,
            submissionDate: sameDate,
            responseDate: sameDate,
          }),
          new PlanningReferral({
            auditCreatedAt: sameDate,
            submissionDate: sameDate,
            responseDate: null,
          }),
        ],
      }),
    );

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(2);
    expect(res[0].htmlText).toEqual('Referral #1');
    expect(res[0].isFulfilled).toBeTruthy();
    expect(res[1].htmlText).toEqual('Referral #2');
    expect(res[1].isFulfilled).toBeFalsy();
  });

  it('should map Decision Events', async () => {
    const sameDate = new Date();
    mockPlanningReviewDecisionService.getByFileNumber.mockResolvedValue([
      new PlanningReviewDecision({
        date: new Date(sameDate.getTime() + 1000),
      }),
      new PlanningReviewDecision({
        date: sameDate,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(2);
    expect(res[0].htmlText).toEqual('Decision #2');
    expect(res[1].htmlText).toEqual('Decision #1');
  });

  it('should map Meeting Events', async () => {
    const sameDate = new Date();
    mockPlanningReviewMeetingService.getByPlanningReview.mockResolvedValue([
      new PlanningReviewMeeting({
        date: new Date(sameDate.getTime() + 1000),
        type: {
          label: 'Other Meeting',
          code: 'CATS',
        } as PlanningReviewMeetingType,
      }),
      new PlanningReviewMeeting({
        date: sameDate,
        type: {
          label: 'Meeting',
          code: 'CATS',
        } as PlanningReviewMeetingType,
      }),
    ]);

    const res = await service.getTimelineEvents('file-number');

    expect(res).toBeDefined();
    expect(res.length).toEqual(2);
    expect(res[0].htmlText).toEqual('Scheduled Date - Other Meeting');
    expect(res[1].htmlText).toEqual('Scheduled Date - Meeting');
  });
});

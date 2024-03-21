import { Injectable } from '@nestjs/common';
import { CardSubtask } from '../../card/card-subtask/card-subtask.entity';
import { PlanningReviewDecisionService } from '../planning-review-decision/planning-review-decision.service';
import { PlanningReviewMeetingService } from '../planning-review-meeting/planning-review-meeting.service';
import { PlanningReview } from '../planning-review.entity';
import { PlanningReviewService } from '../planning-review.service';

export interface TimelineEvent {
  htmlText: string;
  startDate: number;
  fulfilledDate: number | null;
  isFulfilled: boolean;
  link?: string | null;
}

const SORTING_ORDER = {
  //high comes first, 1 shows at bottom
  DECISION: 3,
  MEETING: 2,
  REFERRAL: 1,
};

@Injectable()
export class PlanningReviewTimelineService {
  constructor(
    private planningReviewDecisionService: PlanningReviewDecisionService,
    private planningReviewService: PlanningReviewService,
    private planningReviewMeetingService: PlanningReviewMeetingService, //private planningReferralService: PlanningReferralService,
  ) {}

  async getTimelineEvents(fileNumber: string) {
    const events: TimelineEvent[] = [];
    const planningReview =
      await this.planningReviewService.getDetailedReview(fileNumber);
    await this.addPlanningReferralEvents(planningReview, events);
    await this.addDecisionEvents(planningReview, events);
    await this.addMeetingEvents(planningReview, events);

    events.sort((a, b) => b.startDate - a.startDate);
    return events;
  }

  private mapSubtaskToEvent(subtask: CardSubtask): TimelineEvent {
    return {
      htmlText: `${subtask.type.label} Subtask`,
      fulfilledDate: subtask.completedAt?.getTime() ?? null,
      startDate: subtask.createdAt.getTime(),
      isFulfilled: !!subtask.completedAt,
    };
  }

  private async addDecisionEvents(
    planningReview: PlanningReview,
    events: TimelineEvent[],
  ) {
    const decisions = await this.planningReviewDecisionService.getByFileNumber(
      planningReview.fileNumber,
    );
    const sorted = decisions.filter((dec) => !dec.isDraft).sort();

    for (const [index, decision] of sorted.entries()) {
      events.push({
        htmlText: `Decision #${decisions.length - index}`,
        startDate: decision.date!.getTime() + SORTING_ORDER.DECISION,
        fulfilledDate: null,
        isFulfilled: true,
      });
    }
  }

  private async addMeetingEvents(
    planningReview: PlanningReview,
    events: TimelineEvent[],
  ) {
    const meetings =
      await this.planningReviewMeetingService.getByPlanningReview(
        planningReview.uuid,
      );

    meetings.sort((a, b) => a.date.getTime() - b.date.getTime());
    const typeCount = new Map<string, number>();
    meetings.forEach((meeting) => {
      const count = typeCount.get(meeting.type.code) || 0;
      events.push({
        htmlText: `Scheduled Date - ${meeting.type.label}`,
        startDate: meeting.date.getTime() + SORTING_ORDER.MEETING,
        fulfilledDate: null,
        isFulfilled: true,
      });

      typeCount.set(meeting.type.code, count + 1);
    });
  }

  private async addPlanningReferralEvents(
    planningReview: PlanningReview,
    events: TimelineEvent[],
  ) {
    const referrals = planningReview.referrals;
    referrals.sort(
      (a, b) => a.auditCreatedAt.getTime() - b.auditCreatedAt.getTime(),
    );
    for (const [index, referral] of planningReview.referrals.entries()) {
      events.push({
        htmlText: `Referral #${index + 1}`,
        startDate: referral.submissionDate.getTime() + SORTING_ORDER.REFERRAL,
        fulfilledDate: referral.responseDate?.getTime() ?? null,
        isFulfilled: !!referral.responseDate,
        link: './referrals',
      });

      if (referral.card) {
        for (const subtask of referral.card.subtasks) {
          const mappedEvent = this.mapSubtaskToEvent(subtask);
          events.push(mappedEvent);
        }
      }
    }
  }
}

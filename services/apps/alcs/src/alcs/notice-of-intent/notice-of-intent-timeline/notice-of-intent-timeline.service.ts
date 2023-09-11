import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardSubtask } from '../../card/card-subtask/card-subtask.entity';
import { NoticeOfIntentDecision } from '../../notice-of-intent-decision/notice-of-intent-decision.entity';
import { NoticeOfIntentModification } from '../../notice-of-intent-decision/notice-of-intent-modification/notice-of-intent-modification.entity';
import { NoticeOfIntentMeetingService } from '../notice-of-intent-meeting/notice-of-intent-meeting.service';
import { NoticeOfIntent } from '../notice-of-intent.entity';
import { NoticeOfIntentService } from '../notice-of-intent.service';
import { NoticeOfIntentSubmissionStatusService } from '../notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NOI_SUBMISSION_STATUS } from '../notice-of-intent-submission-status/notice-of-intent-status.dto';

export interface TimelineEvent {
  htmlText: string;
  startDate: number;
  fulfilledDate: number | null;
  isFulfilled: boolean;
  link?: string | null;
}

const SORTING_ORDER = {
  //high comes first, 1 shows at bottom
  MODIFICATION_REVIEW: 12,
  MODIFICATION_REQUEST: 11,
  CHAIR_REVIEW_DECISION: 10,
  AUDITED_DECISION: 9,
  DECISION_MADE: 8,
  VISIT_REPORTS: 7,
  VISIT_REQUESTS: 6,
  ACKNOWLEDGE_COMPLETE: 5,
  RECEIVED_ALL_ITEMS: 4,
  FEE_RECEIVED: 3,
  ACKNOWLEDGED_INCOMPLETE: 2,
  SUBMITTED: 1,
};

const editLink = new Map<string, string>([['IR', './info-request']]);

@Injectable()
export class NoticeOfIntentTimelineService {
  constructor(
    @InjectRepository(NoticeOfIntent)
    private noticeOfIntentRepo: Repository<NoticeOfIntent>,
    @InjectRepository(NoticeOfIntentModification)
    private noticeOfIntentModificationRepo: Repository<NoticeOfIntentModification>,
    @InjectRepository(NoticeOfIntentDecision)
    private noticeOfIntentDecisionRepo: Repository<NoticeOfIntentDecision>,
    private noticeOfIntentService: NoticeOfIntentService,
    private noticeOfIntentMeetingService: NoticeOfIntentMeetingService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
  ) {}

  async getTimelineEvents(fileNumber: string) {
    const events: TimelineEvent[] = [];
    const noticeOfIntent = await this.noticeOfIntentRepo.findOneOrFail({
      where: {
        fileNumber,
      },
      relations: {
        card: {
          type: true,
          subtasks: {
            type: true,
          },
        },
      },
      withDeleted: true,
    });
    this.addNoticeOfIntentEvents(noticeOfIntent, events);
    await this.addDecisionEvents(noticeOfIntent, events);
    await this.addModificationEvents(noticeOfIntent, events);
    await this.addMeetingEvents(noticeOfIntent, events);
    if (noticeOfIntent.source === 'APPLICANT') {
      await this.addStatusEvents(noticeOfIntent, events);
    }
    if (noticeOfIntent.card) {
      for (const subtask of noticeOfIntent.card.subtasks) {
        const mappedEvent = this.mapSubtaskToEvent(subtask);
        events.push(mappedEvent);
      }
    }

    events.sort((a, b) => b.startDate - a.startDate);
    return events;
  }

  private addNoticeOfIntentEvents(
    noticeOfIntent: NoticeOfIntent,
    events: TimelineEvent[],
  ) {
    if (noticeOfIntent.dateAcknowledgedComplete) {
      events.push({
        htmlText: 'Acknowledged Complete',
        startDate:
          noticeOfIntent.dateAcknowledgedComplete.getTime() +
          SORTING_ORDER.ACKNOWLEDGE_COMPLETE,
        isFulfilled: true,
        fulfilledDate: null,
      });
    }

    if (noticeOfIntent.feePaidDate) {
      events.push({
        htmlText: 'Fee Received Date',
        startDate:
          noticeOfIntent.feePaidDate.getTime() + SORTING_ORDER.FEE_RECEIVED,
        isFulfilled: true,
        fulfilledDate: null,
      });
    }
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
    noticeOfIntent: NoticeOfIntent,
    events: TimelineEvent[],
  ) {
    const decisions = await this.noticeOfIntentDecisionRepo.find({
      where: {
        noticeOfIntentUuid: noticeOfIntent.uuid,
        isDraft: false,
      },
      order: {
        date: 'DESC',
      },
    });

    const mappedNOIs = await this.noticeOfIntentService.mapToDtos([
      noticeOfIntent,
    ]);
    const mappedNOI = mappedNOIs[0];

    for (const [index, decision] of decisions.entries()) {
      if (decision.auditDate) {
        events.push({
          htmlText: `Audited Decision #${decisions.length - index}`,
          startDate:
            decision.auditDate.getTime() + SORTING_ORDER.AUDITED_DECISION,
          fulfilledDate: null,
          isFulfilled: true,
        });
      }

      const isAddDecisionReleasedTitle =
        noticeOfIntent.decisionDate !== null &&
        decision.date !== null &&
        noticeOfIntent.decisionDate?.toDateString() ===
          decision.date?.toDateString();

      const decisionReleasedTitle = ' - <b>Decision Released</b>';

      events.push({
        htmlText: `Decision #${decisions.length - index} Made${
          decisions.length - 1 === index
            ? ` - Active Days: ${mappedNOI.activeDays}${
                isAddDecisionReleasedTitle ? decisionReleasedTitle : ''
              }`
            : ''
        }`,
        startDate: decision.date!.getTime() + SORTING_ORDER.DECISION_MADE,
        fulfilledDate: null,
        isFulfilled: true,
      });
    }
  }

  private async addModificationEvents(
    noticeOfIntent: NoticeOfIntent,
    events: TimelineEvent[],
  ) {
    const modifications = await this.noticeOfIntentModificationRepo.find({
      where: {
        noticeOfIntentUuid: noticeOfIntent.uuid,
      },
      relations: {
        card: {
          subtasks: {
            type: true,
          },
        },
      },
      order: {
        submittedDate: 'DESC',
      },
    });

    for (const [index, modification] of modifications.entries()) {
      events.push({
        htmlText: `Modification Requested #${modifications.length - index}`,
        startDate:
          modification.submittedDate.getTime() +
          SORTING_ORDER.MODIFICATION_REQUEST,
        fulfilledDate: null,
        isFulfilled: true,
      });

      if (modification.card) {
        for (const subtask of modification.card.subtasks) {
          const mappedEvent = this.mapSubtaskToEvent(subtask);
          events.push(mappedEvent);
        }
      }

      if (modification.outcomeNotificationDate) {
        events.push({
          htmlText: `Modification Request Reviewed #${
            modifications.length - index
          } - ${modification.reviewOutcome.label}`,
          startDate:
            modification.outcomeNotificationDate.getTime() +
            SORTING_ORDER.MODIFICATION_REVIEW,
          fulfilledDate: null,
          isFulfilled: true,
        });
      }
    }
  }

  private async addMeetingEvents(
    noticeOfIntent: NoticeOfIntent,
    events: TimelineEvent[],
  ) {
    const meetings = await this.noticeOfIntentMeetingService.getByFileNumber(
      noticeOfIntent.fileNumber,
    );

    meetings.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const typeCount = new Map<string, number>();
    meetings.forEach((meeting) => {
      const count = typeCount.get(meeting.type.code) || 0;
      events.push({
        htmlText: `${meeting.type.label} #${count + 1}`,
        startDate: meeting.startDate.getTime() + SORTING_ORDER.VISIT_REQUESTS,
        fulfilledDate: meeting.endDate?.getTime() ?? null,
        isFulfilled: !!meeting.endDate,
        link: editLink.get(meeting.type.code),
      });

      typeCount.set(meeting.type.code, count + 1);
    });
  }

  private async addStatusEvents(
    noticeOfIntent: NoticeOfIntent,
    events: TimelineEvent[],
  ) {
    const statusHistory =
      await this.noticeOfIntentSubmissionStatusService.getCurrentStatusesByFileNumber(
        noticeOfIntent.fileNumber,
      );

    const statusesToInclude = statusHistory.filter(
      (status) => NOI_SUBMISSION_STATUS.ALC_DECISION !== status.statusType.code,
    );

    for (const status of statusesToInclude) {
      if (status.effectiveDate) {
        let htmlText = `<strong>${status.statusType.label}</strong>`;

        if (status.statusType.code === NOI_SUBMISSION_STATUS.IN_PROGRESS) {
          htmlText = 'Created - <strong>In Progress</strong>';
        }

        if (
          status.statusType.code ===
          NOI_SUBMISSION_STATUS.SUBMITTED_TO_ALC_INCOMPLETE
        ) {
          htmlText =
            'Acknowledged Incomplete - <strong>Submitted to ALC - Incomplete</strong>';
        }

        if (status.statusType.code === NOI_SUBMISSION_STATUS.RECEIVED_BY_ALC) {
          htmlText = 'Received All Items - <strong>Received by ALC</strong>';
        }

        events.push({
          htmlText,
          startDate: status.effectiveDate.getTime() + status.statusType.weight,
          fulfilledDate: null,
          isFulfilled: true,
        });
      }
    }
  }
}

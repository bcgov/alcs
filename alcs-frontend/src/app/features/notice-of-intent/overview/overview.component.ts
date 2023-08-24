import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatestWith, Subject, takeUntil, tap } from 'rxjs';
import { ApplicationModificationDto } from '../../../services/application/application-modification/application-modification.dto';
import { ApplicationDecisionDto } from '../../../services/application/decision/application-decision-v1/application-decision.dto';
import { NoticeOfIntentDecisionDto } from '../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionService } from '../../../services/notice-of-intent/decision/notice-of-intent-decision.service';
import { NoticeOfIntentMeetingDto } from '../../../services/notice-of-intent/meeting/notice-of-intent-meeting.dto';
import { NoticeOfIntentMeetingService } from '../../../services/notice-of-intent/meeting/notice-of-intent-meeting.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentModificationDto } from '../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { TimelineEvent } from '../../../shared/timeline/timeline.component';

const editLink = new Map<string, string>([['IR', './info-request']]);

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

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  noticeOfIntent?: NoticeOfIntentDto;
  events: TimelineEvent[] = [];
  summary = '';

  private $decisions = new BehaviorSubject<NoticeOfIntentDecisionDto[]>([]);

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private noticeOfIntentMeetingService: NoticeOfIntentMeetingService,
    private noticeOfIntentDecisionService: NoticeOfIntentDecisionService,
    private noticeOfIntentModificationService: NoticeOfIntentModificationService
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent
      .pipe(takeUntil(this.$destroy))
      .pipe(
        tap((noi) => {
          if (noi) {
            this.noticeOfIntentMeetingService.fetch(noi.uuid);
            this.noticeOfIntentDecisionService.fetchByFileNumber(noi.fileNumber).then((res) => {
              this.$decisions.next(res);
            });
          }
        })
      )
      .pipe(
        combineLatestWith(
          this.noticeOfIntentMeetingService.$meetings,
          this.noticeOfIntentModificationService.$modifications,
          this.$decisions
        )
      )
      .subscribe(([noticeOfIntent, meetings, modifications, decisions]) => {
        if (noticeOfIntent) {
          this.summary = noticeOfIntent.summary || '';
          this.noticeOfIntent = noticeOfIntent;
          this.populateEvents(noticeOfIntent, meetings, modifications, decisions);
        }
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSaveSummary(updatedSummary: string) {
    if (this.noticeOfIntent) {
      await this.noticeOfIntentDetailService.update(this.noticeOfIntent.fileNumber, {
        summary: updatedSummary ?? null,
      });
    }
  }

  private populateEvents(
    noticeOfIntent: NoticeOfIntentDto,
    meetings: NoticeOfIntentMeetingDto[],
    modifications: NoticeOfIntentModificationDto[],
    decisions: NoticeOfIntentDecisionDto[]
  ) {
    const mappedEvents: TimelineEvent[] = [];
    if (noticeOfIntent.dateSubmittedToAlc) {
      mappedEvents.push({
        htmlText: 'Submitted to ALC',
        startDate: new Date(noticeOfIntent.dateSubmittedToAlc + SORTING_ORDER.SUBMITTED),
        isFulfilled: true,
      });
    }

    if (noticeOfIntent.dateAcknowledgedIncomplete) {
      mappedEvents.push({
        htmlText: 'Acknowledged Incomplete',
        startDate: new Date(noticeOfIntent.dateAcknowledgedIncomplete + SORTING_ORDER.ACKNOWLEDGED_INCOMPLETE),
        isFulfilled: true,
      });
    }

    if (noticeOfIntent.dateAcknowledgedComplete) {
      mappedEvents.push({
        htmlText: 'Acknowledged Complete',
        startDate: new Date(noticeOfIntent.dateAcknowledgedComplete + SORTING_ORDER.ACKNOWLEDGE_COMPLETE),
        isFulfilled: true,
      });
    }

    if (noticeOfIntent.feePaidDate) {
      mappedEvents.push({
        htmlText: 'Fee Received Date',
        startDate: new Date(noticeOfIntent.feePaidDate + SORTING_ORDER.FEE_RECEIVED),
        isFulfilled: true,
      });
    }

    if (noticeOfIntent.dateReceivedAllItems) {
      mappedEvents.push({
        htmlText: 'Received All Items',
        startDate: new Date(noticeOfIntent.dateReceivedAllItems + SORTING_ORDER.FEE_RECEIVED),
        isFulfilled: true,
      });
    }

    for (const [index, decision] of decisions.entries()) {
      if (decision.auditDate) {
        mappedEvents.push({
          htmlText: `Audited Decision #${decisions.length - index}`,
          startDate: new Date(decision.auditDate + SORTING_ORDER.AUDITED_DECISION),
          isFulfilled: true,
        });
      }

      mappedEvents.push({
        htmlText: `Decision #${decisions.length - index} Made${
          decisions.length - 1 === index ? ` - Active Days: ${noticeOfIntent.activeDays}` : ''
        }`,
        startDate: new Date(decision.date! + SORTING_ORDER.DECISION_MADE),
        isFulfilled: true,
      });
    }

    meetings.sort((a, b) => a.meetingStartDate - b.meetingStartDate);
    const typeCount = new Map<string, number>();
    meetings.forEach((meeting) => {
      const count = typeCount.get(meeting.meetingType.code) || 0;
      mappedEvents.push({
        htmlText: `${meeting.meetingType.label} #${count + 1}`,
        startDate: new Date(meeting.meetingStartDate + SORTING_ORDER.VISIT_REQUESTS),
        fulfilledDate: meeting.meetingEndDate ? new Date(meeting.meetingEndDate) : undefined,
        isFulfilled: !!meeting.meetingEndDate,
        link: editLink.get(meeting.meetingType.code),
      });

      typeCount.set(meeting.meetingType.code, count + 1);
    });

    const mappedModifications = this.mapModificationsToEvents(modifications);
    mappedEvents.push(...mappedModifications);

    mappedEvents.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    this.events = mappedEvents;
  }

  private mapModificationsToEvents(modifications: NoticeOfIntentModificationDto[]) {
    const events: TimelineEvent[] = [];
    for (const [index, modification] of modifications.sort((a, b) => b.submittedDate - a.submittedDate).entries()) {
      events.push({
        htmlText: `Modification Requested #${modifications.length - index}`,
        startDate: new Date(modification.submittedDate + SORTING_ORDER.MODIFICATION_REQUEST),
        isFulfilled: true,
      });

      if (modification.outcomeNotificationDate) {
        events.push({
          htmlText: `Modification Request Reviewed #${modifications.length - index} - ${
            modification.reviewOutcome.label
          }`,
          startDate: new Date(modification.submittedDate + SORTING_ORDER.MODIFICATION_REQUEST),
          isFulfilled: true,
        });
      }
    }
    return events;
  }
}

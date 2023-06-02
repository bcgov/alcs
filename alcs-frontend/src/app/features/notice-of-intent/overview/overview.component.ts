import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatestWith, Subject, takeUntil, tap } from 'rxjs';
import { NoticeOfIntentMeetingDto } from '../../../services/notice-of-intent/meeting/notice-of-intent-meeting.dto';
import { NoticeOfIntentMeetingService } from '../../../services/notice-of-intent/meeting/notice-of-intent-meeting.service';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { TimelineEvent } from '../../../shared/timeline/timeline.component';

const editLink = new Map<string, string>([['IR', './info-request']]);

const SORTING_ORDER = {
  //high comes first, 1 shows at bottom
  MODIFICATION_REVIEW: 13,
  MODIFICATION_REQUEST: 12,
  RECON_REVIEW: 11,
  RECON_REQUEST: 10,
  CHAIR_REVIEW_DECISION: 9,
  AUDITED_DECISION: 8,
  DECISION_MADE: 7,
  VISIT_REPORTS: 6,
  VISIT_REQUESTS: 5,
  ACKNOWLEDGE_COMPLETE: 4,
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

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private noticeOfIntentMeetingService: NoticeOfIntentMeetingService
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent
      .pipe(takeUntil(this.$destroy))
      .pipe(
        tap((noi) => {
          if (noi) {
            this.noticeOfIntentMeetingService.fetch(noi.uuid);
          }
        })
      )
      .pipe(combineLatestWith(this.noticeOfIntentMeetingService.$meetings))
      .subscribe(([noticeOfIntent, meetings]) => {
        if (noticeOfIntent) {
          this.summary = noticeOfIntent.summary || '';
          this.noticeOfIntent = noticeOfIntent;
          this.populateEvents(noticeOfIntent, meetings);
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

  private populateEvents(noticeOfIntent: NoticeOfIntentDto, meetings: NoticeOfIntentMeetingDto[]) {
    const mappedEvents: TimelineEvent[] = [];
    if (noticeOfIntent.dateSubmittedToAlc) {
      mappedEvents.push({
        name: 'Submitted to ALC',
        startDate: new Date(noticeOfIntent.dateSubmittedToAlc + SORTING_ORDER.SUBMITTED),
        isFulfilled: true,
      });
    }

    if (noticeOfIntent.dateAcknowledgedIncomplete) {
      mappedEvents.push({
        name: 'Acknowledged Incomplete',
        startDate: new Date(noticeOfIntent.dateAcknowledgedIncomplete + SORTING_ORDER.ACKNOWLEDGED_INCOMPLETE),
        isFulfilled: true,
      });
    }

    if (noticeOfIntent.dateAcknowledgedComplete) {
      mappedEvents.push({
        name: 'Acknowledged Complete',
        startDate: new Date(noticeOfIntent.dateAcknowledgedComplete + SORTING_ORDER.ACKNOWLEDGE_COMPLETE),
        isFulfilled: true,
      });
    }

    if (noticeOfIntent.feePaidDate) {
      mappedEvents.push({
        name: 'Fee Received Date',
        startDate: new Date(noticeOfIntent.feePaidDate + SORTING_ORDER.FEE_RECEIVED),
        isFulfilled: true,
      });
    }

    meetings.sort((a, b) => a.meetingStartDate - b.meetingStartDate);
    const typeCount = new Map<string, number>();
    meetings.forEach((meeting) => {
      const count = typeCount.get(meeting.meetingType.code) || 0;
      mappedEvents.push({
        name: `${meeting.meetingType.label} #${count + 1}`,
        startDate: new Date(meeting.meetingStartDate + SORTING_ORDER.VISIT_REQUESTS),
        fulfilledDate: meeting.meetingEndDate ? new Date(meeting.meetingEndDate) : undefined,
        isFulfilled: !!meeting.meetingEndDate,
        link: editLink.get(meeting.meetingType.code),
      });

      typeCount.set(meeting.meetingType.code, count + 1);
    });

    mappedEvents.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    this.events = mappedEvents;
  }
}

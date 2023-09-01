import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { TimelineEventDto } from '../../../services/notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.dto';
import { NoticeOfIntentTimelineService } from '../../../services/notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.service';
import {
  NOI_SUBMISSION_STATUS,
  NoticeOfIntentDto,
  NoticeOfIntentSubmissionToSubmissionStatusDto,
} from '../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  noticeOfIntent?: NoticeOfIntentDto;
  events: TimelineEventDto[] = [];
  summary = '';
  isCancelled = false;

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    private noticeOfIntentTimelineService: NoticeOfIntentTimelineService
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent
      .pipe(takeUntil(this.$destroy))
      .subscribe(async (noticeOfIntent) => {
        if (noticeOfIntent) {
          this.noticeOfIntent = noticeOfIntent;
          this.events = await this.noticeOfIntentTimelineService.fetchByFileNumber(noticeOfIntent.fileNumber);
          this.loadStatusHistory(this.noticeOfIntent.fileNumber);
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

  private async loadStatusHistory(fileNumber: string) {
    let statusHistory: NoticeOfIntentSubmissionToSubmissionStatusDto[] = [];
    try {
      statusHistory = await this.noticeOfIntentSubmissionStatusService.fetchSubmissionStatusesByFileNumber(
        fileNumber,
        false
      );
    } catch (e) {
      console.warn(`No statuses for ${fileNumber}. Is it a manually created submission?`);
    }

    this.isCancelled =
      statusHistory.filter(
        (status) => status.effectiveDate && status.statusTypeCode === NOI_SUBMISSION_STATUS.CANCELLED
      ).length > 0;
  }
}

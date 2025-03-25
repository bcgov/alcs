import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentSubmissionStatusService } from '../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { TimelineEventDto } from '../../../services/notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.dto';
import { NoticeOfIntentTimelineService } from '../../../services/notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.service';
import {
  NOI_SUBMISSION_STATUS,
  NoticeOfIntentDto,
  NoticeOfIntentSubmissionToSubmissionStatusDto,
} from '../../../services/notice-of-intent/notice-of-intent.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { UncancelNoticeOfIntentDialogComponent } from './uncancel-notice-of-intent-dialog/uncancel-notice-of-intent-dialog.component';
import { CancelNoticeOfIntentDialogComponent } from './cancel-notice-of-intent-dialog/cancel-notice-of-intent-dialog.component';

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
  isHiddenFromPortal = false;

  constructor(
    private noticeOfIntentDetailService: NoticeOfIntentDetailService,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    private noticeOfIntentTimelineService: NoticeOfIntentTimelineService,
    private confirmationDialogService: ConfirmationDialogService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.noticeOfIntentDetailService.$noticeOfIntent
      .pipe(takeUntil(this.$destroy))
      .subscribe(async (noticeOfIntent) => {
        if (noticeOfIntent) {
          this.noticeOfIntent = noticeOfIntent;
          this.isHiddenFromPortal = noticeOfIntent.hideFromPortal;
          this.summary = noticeOfIntent.summary ?? '';
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
        false,
      );
    } catch (e) {
      console.warn(`No statuses for ${fileNumber}. Is it a manually created submission?`);
    }

    this.isCancelled =
      statusHistory.filter(
        (status) => status.effectiveDate && status.statusTypeCode === NOI_SUBMISSION_STATUS.CANCELLED,
      ).length > 0;
  }

  async onCancel() {
    if (this.noticeOfIntent) {
      this.dialog
        .open(CancelNoticeOfIntentDialogComponent, {
          minWidth: '1080px',
          maxWidth: '1080px',
          maxHeight: '80vh',
          width: '90%',
          autoFocus: false,
          data: {
            fileNumber: this.noticeOfIntent.fileNumber,
          },
        })
        .beforeClosed()
        .subscribe(async ({didConfirm, sendEmail}) => {
          if (didConfirm && this.noticeOfIntent) {
            await this.noticeOfIntentDetailService.cancel(this.noticeOfIntent.fileNumber, sendEmail);
            await this.loadStatusHistory(this.noticeOfIntent.fileNumber);
          }
        });
    }
  }

  async onUncancel() {
    if (this.noticeOfIntent) {
      this.dialog
        .open(UncancelNoticeOfIntentDialogComponent, {
          data: {
            fileNumber: this.noticeOfIntent.fileNumber,
          },
        })
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm && this.noticeOfIntent) {
            await this.noticeOfIntentDetailService.uncancel(this.noticeOfIntent.fileNumber);
            await this.loadStatusHistory(this.noticeOfIntent.fileNumber);
          }
        });
    }
  }

  onTogglePortalVisible() {
    if (this.isHiddenFromPortal) {
      this.confirmationDialogService
        .openDialog({
          body: 'If you continue, this File ID will not return any search results for the L/FNG and the public. Please add a journal note to explain why this file is restricted.',
        })
        .subscribe((didConfirm) => {
          this.isHiddenFromPortal = didConfirm;
          if (didConfirm && this.noticeOfIntent) {
            this.noticeOfIntentDetailService.update(this.noticeOfIntent.fileNumber, {
              hideFromPortal: true,
            });
          }
        });
    } else {
      this.confirmationDialogService
        .openDialog({
          body: 'Are you sure you want to remove the access restriction for the L/FNG and public? If you continue, this File ID could return search results for the L/FNG and the public. Standard rules for showing/hiding content will apply.',
        })
        .subscribe((didConfirm) => {
          this.isHiddenFromPortal = !didConfirm;
          if (didConfirm && this.noticeOfIntent) {
            this.noticeOfIntentDetailService.update(this.noticeOfIntent.fileNumber, {
              hideFromPortal: false,
            });
          }
        });
    }
  }
}

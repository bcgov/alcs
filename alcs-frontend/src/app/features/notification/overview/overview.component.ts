import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { TimelineEventDto } from '../../../services/notice-of-intent/notice-of-intent-timeline/notice-of-intent-timeline.dto';
import { NotificationDetailService } from '../../../services/notification/notification-detail.service';
import { NotificationSubmissionStatusService } from '../../../services/notification/notification-submission-status/notification-submission-status.service';
import { NotificationTimelineService } from '../../../services/notification/notification-timeline/notification-timeline.service';
import { NOTIFICATION_STATUS, NotificationDto } from '../../../services/notification/notification.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { UncancelNotificationDialogComponent } from './uncancel-notification-dialog/uncancel-notification-dialog.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  notification?: NotificationDto;
  events: TimelineEventDto[] = [];
  summary = '';
  isCancelled = false;

  constructor(
    private notificationDetailService: NotificationDetailService,
    private notificationSubmissionService: NotificationSubmissionStatusService,
    private notificationTimelineService: NotificationTimelineService,
    private confirmationDialogService: ConfirmationDialogService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.notificationDetailService.$notification.pipe(takeUntil(this.$destroy)).subscribe(async (notification) => {
      if (notification) {
        this.notification = notification;
        this.summary = notification.summary ?? '';
        this.events = await this.notificationTimelineService.fetchByFileNumber(notification.fileNumber);
        this.loadStatusHistory(this.notification.fileNumber);
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSaveSummary(updatedSummary: string) {
    if (this.notification) {
      await this.notificationDetailService.update(this.notification.fileNumber, {
        summary: updatedSummary ?? null,
      });
    }
  }

  private async loadStatusHistory(fileNumber: string) {
    const statusHistory = await this.notificationSubmissionService.fetchSubmissionStatusesByFileNumber(fileNumber);

    this.isCancelled =
      statusHistory.filter((status) => status.effectiveDate && status.statusTypeCode === NOTIFICATION_STATUS.CANCELLED)
        .length > 0;
  }

  async onCancel() {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to cancel this Notification?`,
        cancelButtonText: 'No',
        title: 'Cancel Notification',
      })
      .subscribe(async (didConfirm) => {
        if (didConfirm && this.notification) {
          await this.notificationDetailService.cancel(this.notification.fileNumber);
          await this.loadStatusHistory(this.notification.fileNumber);
        }
      });
  }

  async onUncancel() {
    if (this.notification) {
      this.dialog
        .open(UncancelNotificationDialogComponent, {
          data: {
            fileNumber: this.notification.fileNumber,
          },
        })
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm && this.notification) {
            await this.notificationDetailService.uncancel(this.notification.fileNumber);
            await this.loadStatusHistory(this.notification.fileNumber);
          }
        });
    }
  }
}

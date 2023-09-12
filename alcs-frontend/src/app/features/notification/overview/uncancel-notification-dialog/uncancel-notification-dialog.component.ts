import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_NO_STATUS } from '../../../../services/application/application-submission-status/application-submission-status.dto';
import { SUBMISSION_STATUS } from '../../../../services/application/application.dto';
import { NotificationSubmissionStatusService } from '../../../../services/notification/notification-submission-status/notification-submission-status.service';
import { NotificationSubmissionToSubmissionStatusDto } from '../../../../services/notification/notification.dto';
import { ApplicationSubmissionStatusPill } from '../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';

@Component({
  selector: 'app-uncancel-notice-of-intent-dialog',
  templateUrl: './uncancel-notification-dialog.component.html',
  styleUrls: ['./uncancel-notification-dialog.component.scss'],
})
export class UncancelNotificationDialogComponent {
  status?: ApplicationSubmissionStatusPill;

  constructor(
    public matDialogRef: MatDialogRef<UncancelNotificationDialogComponent>,
    private notificationSubmissionStatusService: NotificationSubmissionStatusService,
    @Inject(MAT_DIALOG_DATA) data: { fileNumber: string }
  ) {
    this.calculateStatusChange(data.fileNumber);
  }

  async calculateStatusChange(fileNumber: string) {
    let statusHistory: NotificationSubmissionToSubmissionStatusDto[] = [];

    try {
      statusHistory = await this.notificationSubmissionStatusService.fetchSubmissionStatusesByFileNumber(fileNumber);
    } catch (e) {
      console.warn(`No statuses for ${fileNumber}. Is it a manually created submission?`);
    }

    const validStatuses = statusHistory
      .filter(
        (status) =>
          status.effectiveDate &&
          status.statusTypeCode !== SUBMISSION_STATUS.CANCELLED &&
          status.effectiveDate < Date.now()
      )
      .sort((a, b) => b.status.weight! - a.status.weight!);
    if (validStatuses && validStatuses.length > 0) {
      const validStatus = validStatuses[0].status;
      this.status = {
        backgroundColor: validStatus.alcsBackgroundColor,
        textColor: validStatus.alcsColor,
        label: validStatus.label,
      };
    } else {
      this.status = DEFAULT_NO_STATUS;
    }
  }

  onConfirm() {
    this.matDialogRef.close(true);
  }
}

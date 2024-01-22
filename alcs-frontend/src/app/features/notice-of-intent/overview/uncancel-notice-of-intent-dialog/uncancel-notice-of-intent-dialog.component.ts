import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_NO_STATUS } from '../../../../services/application/application-submission-status/application-submission-status.dto';
import { SUBMISSION_STATUS } from '../../../../services/application/application.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NoticeOfIntentSubmissionToSubmissionStatusDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { ApplicationSubmissionStatusPill } from '../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';

@Component({
  selector: 'app-uncancel-notice-of-intent-dialog',
  templateUrl: './uncancel-notice-of-intent-dialog.component.html',
  styleUrls: ['./uncancel-notice-of-intent-dialog.component.scss'],
})
export class UncancelNoticeOfIntentDialogComponent {
  status?: ApplicationSubmissionStatusPill;

  constructor(
    public matDialogRef: MatDialogRef<UncancelNoticeOfIntentDialogComponent>,
    private applicationSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    @Inject(MAT_DIALOG_DATA) data: { fileNumber: string }
  ) {
    this.calculateStatusChange(data.fileNumber);
  }

  async calculateStatusChange(fileNumber: string) {
    let statusHistory: NoticeOfIntentSubmissionToSubmissionStatusDto[] = [];

    try {
      statusHistory = await this.applicationSubmissionStatusService.fetchSubmissionStatusesByFileNumber(
        fileNumber,
        false
      );
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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SUBMISSION_STATUS } from '../../../../../services/application/application.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { ApplicationSubmissionStatusPill } from '../../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';

@Component({
  selector: 'app-noi-revert-to-draft-dialog',
  templateUrl: './revert-to-draft-dialog.component.html',
  styleUrls: ['./revert-to-draft-dialog.component.scss'],
})
export class RevertToDraftDialogComponent {
  mappedType?: ApplicationSubmissionStatusPill;

  constructor(
    public matDialogRef: MatDialogRef<RevertToDraftDialogComponent>,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    @Inject(MAT_DIALOG_DATA) data: { fileNumber: string }
  ) {
    this.calculateStatusChange(data.fileNumber);
  }

  async calculateStatusChange(fileNumber: string) {
    const statusHistory = await this.noticeOfIntentSubmissionStatusService.fetchSubmissionStatusesByFileNumber(
      fileNumber
    );
    const validStatuses = statusHistory
      .filter(
        (status) =>
          status.effectiveDate &&
          status.statusTypeCode !== SUBMISSION_STATUS.ALC_DECISION &&
          status.effectiveDate < Date.now()
      )
      .sort((a, b) => b.status.weight! - a.status.weight!);

    if (validStatuses && validStatuses.length > 0) {
      const newStatus = validStatuses[0].status;
      this.mappedType = {
        label: newStatus.label,
        backgroundColor: newStatus.alcsBackgroundColor,
        textColor: newStatus.alcsColor,
      };
    }
  }

  onConfirm() {
    this.matDialogRef.close(true);
  }
}

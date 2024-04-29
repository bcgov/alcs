import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentSubmissionStatusService } from '../../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NOI_SUBMISSION_STATUS } from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { ApplicationSubmissionStatusPill } from '../../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';

@Component({
  selector: 'app-noi-revert-to-draft-dialog',
  templateUrl: './revert-to-draft-dialog.component.html',
  styleUrls: ['./revert-to-draft-dialog.component.scss'],
})
export class RevertToDraftDialogComponent {
  mappedType?: ApplicationSubmissionStatusPill;
  isOnlyDecision = true;

  constructor(
    public matDialogRef: MatDialogRef<RevertToDraftDialogComponent>,
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    private noiDecisionService: NoticeOfIntentDecisionV2Service,
    @Inject(MAT_DIALOG_DATA) data: { fileNumber: string },
  ) {
    const decisions = this.noiDecisionService.$decisions.getValue();
    this.isOnlyDecision = decisions.length === 1;

    this.calculateStatusChange(data.fileNumber);
  }

  async calculateStatusChange(fileNumber: string) {
    const statusHistory =
      await this.noticeOfIntentSubmissionStatusService.fetchSubmissionStatusesByFileNumber(fileNumber);
    const validStatuses = statusHistory
      .filter((status) => status.effectiveDate && status.effectiveDate < Date.now())
      .filter((status) => !this.isOnlyDecision || status.statusTypeCode !== NOI_SUBMISSION_STATUS.ALC_DECISION)
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

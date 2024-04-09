import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationSubmissionStatusService } from '../../../../../services/application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../../../services/application/application.dto';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ApplicationSubmissionStatusPill } from '../../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';

@Component({
  selector: 'app-app-revert-to-draft-dialog',
  templateUrl: './revert-to-draft-dialog.component.html',
  styleUrls: ['./revert-to-draft-dialog.component.scss'],
})
export class RevertToDraftDialogComponent {
  mappedType?: ApplicationSubmissionStatusPill;
  isOnlyDecision = true;

  constructor(
    public matDialogRef: MatDialogRef<RevertToDraftDialogComponent>,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    private appDecisionService: ApplicationDecisionV2Service,
    @Inject(MAT_DIALOG_DATA) data: { fileNumber: string },
  ) {
    const decisions = this.appDecisionService.$decisions.getValue();
    this.isOnlyDecision = decisions.length === 1;

    this.calculateStatusChange(data.fileNumber);
  }

  async calculateStatusChange(fileNumber: string) {
    const statusHistory = await this.applicationSubmissionStatusService.fetchSubmissionStatusesByFileNumber(fileNumber);
    const validStatuses = statusHistory
      .filter((status) => status.effectiveDate && status.effectiveDate < Date.now())
      .filter((status) => !this.isOnlyDecision || status.statusTypeCode !== SUBMISSION_STATUS.ALC_DECISION)
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

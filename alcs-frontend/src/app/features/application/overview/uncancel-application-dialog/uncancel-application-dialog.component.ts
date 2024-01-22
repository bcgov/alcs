import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ApplicationSubmissionToSubmissionStatusDto,
  DEFAULT_NO_STATUS,
} from '../../../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationSubmissionStatusService } from '../../../../services/application/application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../../../../services/application/application.dto';
import { ApplicationSubmissionStatusPill } from '../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';

@Component({
  selector: 'app-uncancel-application-dialog',
  templateUrl: './uncancel-application-dialog.component.html',
  styleUrls: ['./uncancel-application-dialog.component.scss'],
})
export class UncancelApplicationDialogComponent {
  status?: ApplicationSubmissionStatusPill;

  constructor(
    public matDialogRef: MatDialogRef<UncancelApplicationDialogComponent>,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    @Inject(MAT_DIALOG_DATA) data: { fileNumber: string }
  ) {
    this.calculateStatusChange(data.fileNumber);
  }

  async calculateStatusChange(fileNumber: string) {
    let statusHistory: ApplicationSubmissionToSubmissionStatusDto[] = [];

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

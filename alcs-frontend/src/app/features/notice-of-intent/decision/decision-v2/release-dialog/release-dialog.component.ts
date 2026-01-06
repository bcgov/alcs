import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentSubmissionStatusService } from '../../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NOI_SUBMISSION_STATUS } from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { ApplicationSubmissionStatusPill } from '../../../../../shared/application-submission-status-type-pill/application-submission-status-type-pill.component';
import { strictEmailValidator } from '../../../../../shared/validators/email-validator';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-release-dialog',
    templateUrl: './release-dialog.component.html',
    styleUrls: ['./release-dialog.component.scss'],
    standalone: false
})
export class ReleaseDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  wasReleased = false;
  isCancelled = false;
  firstDecision = false;
  releasedStatus: ApplicationSubmissionStatusPill | undefined;
  cancelledStatus: ApplicationSubmissionStatusPill | undefined;
  sendEmail = true;

  readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
  emails: string[] = [];

  email = new FormControl<string | null>(null, [strictEmailValidator]);

  constructor(
    private decisionService: NoticeOfIntentDecisionV2Service,
    private submissionStatusService: NoticeOfIntentSubmissionStatusService,
    public matDialogRef: MatDialogRef<ReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: {
      fileNumber: string;
    },
  ) {}

  ngOnInit(): void {
    this.decisionService.$decision.pipe(takeUntil(this.$destroy)).subscribe((decision) => {
      if (decision) {
        this.wasReleased = decision.wasReleased;
      }
    });

    this.calculateStatus();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onRelease() {
    this.matDialogRef.close({
      confirmed: true,
      ccEmails: this.emails,
      sendEmail: this.sendEmail,
    });
  }

  private async calculateStatus() {
    const decisions = this.decisionService.$decisions.getValue();
    this.firstDecision = decisions.length === 1;

    const statuses = await this.submissionStatusService.fetchSubmissionStatusesByFileNumber(this.data.fileNumber);
    const releasedStatus = statuses.find((status) => status.statusTypeCode === NOI_SUBMISSION_STATUS.ALC_DECISION);
    if (releasedStatus) {
      this.releasedStatus = {
        label: releasedStatus.status.label,
        backgroundColor: releasedStatus.status.alcsBackgroundColor,
        borderColor: releasedStatus.status.alcsBackgroundColor,
        textColor: releasedStatus.status.alcsColor,
        shortLabel: releasedStatus.status.label,
      };
    }

    const cancelled = statuses.find(
      (status) => status.effectiveDate && status.statusTypeCode === NOI_SUBMISSION_STATUS.CANCELLED,
    );
    this.isCancelled = !!cancelled;

    if (cancelled) {
      this.cancelledStatus = {
        label: cancelled.status.label,
        backgroundColor: cancelled.status.alcsBackgroundColor,
        textColor: cancelled.status.alcsColor,
      };
    }
  }

  onRemoveEmail(email: string) {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  addEmail(event: MatChipInputEvent): void {
    if (this.email.invalid) {
      return;
    }

    const value = (event.value || '').trim();
    if (value) {
      this.emails.push(value);
    }
    event.chipInput!.clear();
  }

  editEmail(email: string, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.onRemoveEmail(email);
      return;
    }
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails[index] = value;
    }
  }
}

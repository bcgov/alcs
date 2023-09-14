import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDecisionV2Service } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentSubmissionStatusService } from '../../../../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';
import { NOI_SUBMISSION_STATUS } from '../../../../../services/notice-of-intent/notice-of-intent.dto';
import { ApplicationPill } from '../../../../../shared/application-type-pill/application-type-pill.component';

@Component({
  selector: 'app-release-dialog',
  templateUrl: './release-dialog.component.html',
  styleUrls: ['./release-dialog.component.scss'],
})
export class ReleaseDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  mappedType?: ApplicationPill;
  wasReleased = false;

  constructor(
    private noticeOfIntentSubmissionStatusService: NoticeOfIntentSubmissionStatusService,
    private decisionService: NoticeOfIntentDecisionV2Service,
    public matDialogRef: MatDialogRef<ReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {}

  ngOnInit(): void {
    this.decisionService.$decision.pipe(takeUntil(this.$destroy)).subscribe((decision) => {
      if (decision) {
        this.wasReleased = decision.wasReleased;
      }
    });
    this.loadStatuses();
  }

  private async loadStatuses() {
    const statuses = await this.noticeOfIntentSubmissionStatusService.listStatuses();
    if (statuses) {
      const releasedStatus = statuses.find((status) => status.code === NOI_SUBMISSION_STATUS.ALC_DECISION);
      if (releasedStatus) {
        this.mappedType = {
          label: releasedStatus.label,
          backgroundColor: releasedStatus.alcsBackgroundColor,
          borderColor: releasedStatus.alcsBackgroundColor,
          textColor: releasedStatus.alcsColor,
          shortLabel: releasedStatus.label,
        };
      }
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onRelease() {
    this.matDialogRef.close(true);
  }
}

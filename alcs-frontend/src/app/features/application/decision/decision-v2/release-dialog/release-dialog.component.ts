import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { SUBMISSION_STATUS } from '../../../../../services/application/application.dto';
import { ApplicationService } from '../../../../../services/application/application.service';
import { ApplicationPill } from '../../../../../shared/application-type-pill/application-type-pill.component';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';

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
    private applicationService: ApplicationService,
    private decisionService: ApplicationDecisionV2Service,
    public matDialogRef: MatDialogRef<ReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {}

  ngOnInit(): void {
    this.applicationService.$applicationStatuses.pipe(takeUntil(this.$destroy)).subscribe((statuses) => {
      if (statuses) {
        const releasedStatus = statuses.find((status) => status.code === SUBMISSION_STATUS.ALC_DECISION);
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
    });

    this.decisionService.$decision.pipe(takeUntil(this.$destroy)).subscribe((decision) => {
      this.wasReleased = decision?.wasReleased || false;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onRelease() {
    this.matDialogRef.close(true);
  }
}

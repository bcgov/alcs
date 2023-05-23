import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationStatusTypeDto } from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationService } from '../../../../../services/application/application.service';
import { CeoCriterionDto } from '../../../../../services/application/decision/application-decision-v1/application-decision.dto';

@Component({
  selector: 'app-release-dialog',
  templateUrl: './release-dialog.component.html',
  styleUrls: ['./release-dialog.component.scss'],
})
export class ReleaseDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  statuses: ApplicationStatusTypeDto[] = [];
  selectedApplicationStatus = '';
  wasReleased = false;

  constructor(
    private applicationService: ApplicationService,
    public matDialogRef: MatDialogRef<ReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { wasReleased: boolean }
  ) {
    this.wasReleased = data.wasReleased;
  }

  ngOnInit(): void {
    this.applicationService.$applicationStatuses.pipe(takeUntil(this.$destroy)).subscribe((statuses) => {
      if (statuses) {
        this.statuses = statuses.filter((e) => ['ALCD', 'CEOD'].includes(e.code));
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onRelease() {
    this.matDialogRef.close(this.selectedApplicationStatus);
  }
}

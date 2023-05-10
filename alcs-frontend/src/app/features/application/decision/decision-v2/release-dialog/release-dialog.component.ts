import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationStatusTypeDto } from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationService } from '../../../../../services/application/application.service';

@Component({
  selector: 'app-release-dialog',
  templateUrl: './release-dialog.component.html',
  styleUrls: ['./release-dialog.component.scss'],
})
export class ReleaseDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  statuses: ApplicationStatusTypeDto[] = [];
  selectedApplicationStatus = '';

  constructor(
    private applicationService: ApplicationService,
    public matDialogRef: MatDialogRef<ReleaseDialogComponent>
  ) {}

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

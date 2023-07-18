import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationStatusDto } from '../../../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationService } from '../../../../../services/application/application.service';

@Component({
  selector: 'app-revert-to-draft-dialog',
  templateUrl: './revert-to-draft-dialog.component.html',
  styleUrls: ['./revert-to-draft-dialog.component.scss'],
})
export class RevertToDraftDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  statuses: ApplicationStatusDto[] = [];
  selectedApplicationStatus = '';

  constructor(
    private applicationService: ApplicationService,
    public matDialogRef: MatDialogRef<RevertToDraftDialogComponent>
  ) {}

  ngOnInit(): void {
    this.applicationService.$applicationStatuses.pipe(takeUntil(this.$destroy)).subscribe((statuses) => {
      if (statuses) {
        //TODO: This will be done in a future ticket
        //this.statuses = statuses.filter((e) => ['ALCD', 'CEOD'].includes(e.code));
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onConfirm() {
    this.matDialogRef.close({
      status: '',
    });
  }
}

import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';

export interface UnFlagDialogIO {
  decisionNumber?: number;
  confirmed?: boolean;
}

@Component({
    selector: 'app-unflag-dialog',
    templateUrl: './unflag-dialog.component.html',
    styleUrls: ['./unflag-dialog.component.scss'],
    standalone: false
})
export class UnFlagDialogComponent implements OnDestroy {
  $destroy = new Subject<void>();

  constructor(
    public matDialogRef: MatDialogRef<UnFlagDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    protected data: UnFlagDialogIO,
  ) {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  save() {
    const output: UnFlagDialogIO = {
      confirmed: true,
    };
    this.matDialogRef.close(output);
  }
}

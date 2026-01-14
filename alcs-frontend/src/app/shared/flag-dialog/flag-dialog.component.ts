import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import moment, { Moment } from 'moment';

export interface FlagDialogIO {
  isEditing?: boolean;
  decisionNumber?: number;
  reasonFlagged?: string;
  followUpAt?: number | null;
  isSaving?: boolean;
}

@Component({
    selector: 'app-flag-dialog',
    templateUrl: './flag-dialog.component.html',
    styleUrls: ['./flag-dialog.component.scss'],
    standalone: false
})
export class FlagDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  followUpAt?: Moment | null;

  constructor(
    public matDialogRef: MatDialogRef<FlagDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    protected data: FlagDialogIO,
  ) {}

  ngOnInit(): void {
    if (this.data.followUpAt) {
      this.followUpAt = moment(this.data.followUpAt);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  save() {
    const output: FlagDialogIO = {
      isEditing: this.data.isEditing,
      reasonFlagged: this.data.reasonFlagged,
      isSaving: true,
    };

    if (this.followUpAt !== undefined) {
      output.followUpAt = this.followUpAt ? this.followUpAt.toDate().getTime() : null;
    }

    this.matDialogRef.close(output);
  }
}

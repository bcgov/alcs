import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-pr-revert-to-draft-dialog',
    templateUrl: './revert-to-draft-dialog.component.html',
    styleUrls: ['./revert-to-draft-dialog.component.scss'],
    standalone: false
})
export class RevertToDraftDialogComponent {
  constructor(
    public matDialogRef: MatDialogRef<RevertToDraftDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { fileNumber: string },
  ) {}

  onConfirm() {
    this.matDialogRef.close(true);
  }
}

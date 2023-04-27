import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-publish-dialog',
  templateUrl: './confirm-publish-dialog.component.html',
  styleUrls: ['./confirm-publish-dialog.component.scss'],
})
export class ConfirmPublishDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmPublishDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

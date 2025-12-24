import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-cancel-notice-of-intent-dialog',
    templateUrl: './cancel-notice-of-intent-dialog.component.html',
    styleUrls: ['./cancel-notice-of-intent-dialog.component.scss'],
    standalone: false
})
export class CancelNoticeOfIntentDialogComponent {
  sendEmail: boolean = true;

  constructor(
    public matDialogRef: MatDialogRef<CancelNoticeOfIntentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { fileNumber: string }
  ) {}

  onConfirm() {
    this.matDialogRef.close({didConfirm: true, sendEmail: this.sendEmail});
  }
}

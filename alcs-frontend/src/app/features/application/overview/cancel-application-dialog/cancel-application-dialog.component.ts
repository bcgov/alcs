import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-application-dialog',
  templateUrl: './cancel-application-dialog.component.html',
  styleUrls: ['./cancel-application-dialog.component.scss'],
})
export class CancelApplicationDialogComponent {
  sendEmail: boolean = true;

  constructor(
    public matDialogRef: MatDialogRef<CancelApplicationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { fileNumber: string }
  ) {}

  onConfirm() {
    this.matDialogRef.close({didConfirm: true, sendEmail: this.sendEmail});
  }
}

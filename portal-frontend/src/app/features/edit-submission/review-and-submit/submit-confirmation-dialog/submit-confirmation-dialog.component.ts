import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-submit-confirmation-dialog',
  templateUrl: './submit-confirmation-dialog.component.html',
  styleUrls: ['./submit-confirmation-dialog.component.scss'],
})
export class SubmitConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<SubmitConfirmationDialogComponent>) {}

  async onCancel(dialogResult: boolean = false) {
    this.dialogRef.close(dialogResult);
  }

  async onSubmit() {
    this.dialogRef.close(true);
  }
}

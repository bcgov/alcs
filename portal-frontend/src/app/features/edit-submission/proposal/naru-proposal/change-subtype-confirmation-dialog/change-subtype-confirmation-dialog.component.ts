import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-subtype-confirmation-dialog',
  templateUrl: './change-subtype-confirmation-dialog.component.html',
  styleUrls: ['./change-subtype-confirmation-dialog.component.scss'],
})
export class ChangeSubtypeConfirmationDialogComponent {
  stepIdx = 0;

  constructor(private dialogRef: MatDialogRef<ChangeSubtypeConfirmationDialogComponent>) {}

  async onCancel() {
    this.dialogRef.close(false);
  }

  async onConfirm() {
    this.dialogRef.close(true);
  }
}

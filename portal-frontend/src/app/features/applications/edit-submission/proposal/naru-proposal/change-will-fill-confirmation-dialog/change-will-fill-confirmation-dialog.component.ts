import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-will-fill-confirmation-dialog',
  templateUrl: './change-will-fill-confirmation-dialog.component.html',
  styleUrls: ['./change-will-fill-confirmation-dialog.component.scss'],
})
export class ChangeWillFillConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<ChangeWillFillConfirmationDialogComponent>) {}

  async onDecide(decision: boolean) {
    this.dialogRef.close(decision);
  }
}

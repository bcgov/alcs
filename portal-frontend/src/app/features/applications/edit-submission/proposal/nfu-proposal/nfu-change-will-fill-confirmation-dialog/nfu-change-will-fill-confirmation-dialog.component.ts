import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-nfu-change-will-fill-confirmation-dialog',
  templateUrl: './nfu-change-will-fill-confirmation-dialog.component.html',
  styleUrls: ['./nfu-change-will-fill-confirmation-dialog.component.scss'],
})
export class NfuChangeWillFillConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<NfuChangeWillFillConfirmationDialogComponent>) {}

  async onDecide(decision: boolean) {
    this.dialogRef.close(decision);
  }
}

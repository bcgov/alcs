import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-naru-change-will-fill-confirmation-dialog',
  templateUrl: './naru-change-will-fill-confirmation-dialog.component.html',
  styleUrls: ['./naru-change-will-fill-confirmation-dialog.component.scss'],
})
export class NaruChangeWillFillConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<NaruChangeWillFillConfirmationDialogComponent>) {}

  async onDecide(decision: boolean) {
    this.dialogRef.close(decision);
  }
}

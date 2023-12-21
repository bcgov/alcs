import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-primary-contact-confirmation-dialog',
  templateUrl: './primary-contact-confirmation-dialog.component.html',
  styleUrls: ['./primary-contact-confirmation-dialog.component.scss'],
})
export class PrimaryContactConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<PrimaryContactConfirmationDialogComponent>) {}

  async onDecide(decision: boolean = false) {
    this.dialogRef.close(decision);
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-primary-contact-confirmation-dialog',
  templateUrl: './primary-contact-confirmation-dialog.component.html',
  styleUrls: ['./primary-contact-confirmation-dialog.component.scss'],
})
export class PrimaryContactConfirmationDialogComponent {
  public isGovernmentUser: boolean;
  public governmentName: boolean;

  constructor(
    private dialogRef: MatDialogRef<PrimaryContactConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrimaryContactConfirmationDialogComponent
  ) {
    this.isGovernmentUser = data.isGovernmentUser;
    this.governmentName = data.governmentName;
  }

  async onDecide(decision: boolean = false) {
    this.dialogRef.close(decision);
  }
}

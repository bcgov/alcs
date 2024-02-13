import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-other-parcels-confirmation-dialog',
  templateUrl: './other-parcels-confirmation-dialog.component.html',
  styleUrls: ['./other-parcels-confirmation-dialog.component.scss'],
})
export class OtherParcelsConfirmationDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<OtherParcelsConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OtherParcelsConfirmationDialogComponent
  ) {}

  async onDecide(decision: boolean = false) {
    this.dialogRef.close(decision);
  }
}

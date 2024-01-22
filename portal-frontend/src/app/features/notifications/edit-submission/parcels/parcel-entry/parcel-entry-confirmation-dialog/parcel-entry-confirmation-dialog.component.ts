import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificationParcelDeleteStepsEnum } from '../../delete-parcel/delete-parcel-dialog.component';

@Component({
  selector: 'app-parcel-entry-confirmation-dialog',
  templateUrl: './parcel-entry-confirmation-dialog.component.html',
  styleUrls: ['./parcel-entry-confirmation-dialog.component.scss'],
})
export class ParcelEntryConfirmationDialogComponent {
  stepIdx = 0;

  warningStep = NotificationParcelDeleteStepsEnum.warning;
  confirmationStep = NotificationParcelDeleteStepsEnum.confirmation;

  constructor(private dialogRef: MatDialogRef<ParcelEntryConfirmationDialogComponent>) {}

  async next() {
    this.stepIdx += 1;
  }

  async back() {
    this.stepIdx -= 1;
  }

  async onCancel(dialogResult: boolean = false) {
    this.dialogRef.close(dialogResult);
  }

  async onDelete() {
    this.onCancel(true);
  }
}

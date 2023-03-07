import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ApplicationParcelDeleteStepsEnum } from '../../parcel-details/delete-parcel/delete-parcel-dialog.component';

@Component({
  selector: 'app-other-parcel-confirmation-dialog',
  templateUrl: './other-parcel-confirmation-dialog.component.html',
  styleUrls: ['./other-parcel-confirmation-dialog.component.scss'],
})
export class OtherParcelConfirmationDialogComponent {
  stepIdx = 0;

  warningStep = ApplicationParcelDeleteStepsEnum.warning;
  confirmationStep = ApplicationParcelDeleteStepsEnum.confirmation;

  constructor(private dialogRef: MatDialogRef<OtherParcelConfirmationDialogComponent>) {}

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

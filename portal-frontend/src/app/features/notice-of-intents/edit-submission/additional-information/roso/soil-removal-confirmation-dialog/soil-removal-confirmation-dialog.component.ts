import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DeleteStructureConfirmationDialogComponent } from '../delete-structure-confirmation-dialog/delete-structure-confirmation-dialog.component';

@Component({
  selector: 'app-soil-removal-confirmation-dialog',
  templateUrl: './soil-removal-confirmation-dialog.component.html',
  styleUrls: ['./soil-removal-confirmation-dialog.component.scss'],
})
export class SoilRemovalConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<DeleteStructureConfirmationDialogComponent>) {}

  async onCancel(dialogResult: boolean = false) {
    this.dialogRef.close(dialogResult);
  }

  async onConfirm() {
    this.onCancel(true);
  }
}

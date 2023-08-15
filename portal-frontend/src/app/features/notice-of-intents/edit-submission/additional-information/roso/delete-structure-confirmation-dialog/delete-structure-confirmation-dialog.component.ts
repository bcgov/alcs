import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-structure-confirmation-dialog',
  templateUrl: './delete-structure-confirmation-dialog.component.html',
  styleUrls: ['./delete-structure-confirmation-dialog.component.scss'],
})
export class DeleteStructureConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<DeleteStructureConfirmationDialogComponent>) {}

  async onCancel(dialogResult: boolean = false) {
    this.dialogRef.close(dialogResult);
  }

  async onConfirm() {
    this.onCancel(true);
  }
}

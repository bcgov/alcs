import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-remove-file-confirmation-dialog',
  templateUrl: './remove-file-confirmation-dialog.component.html',
  styleUrls: ['./remove-file-confirmation-dialog.component.scss'],
})
export class RemoveFileConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<RemoveFileConfirmationDialogComponent>) {}

  async onCancel(dialogResult: boolean = false) {
    this.dialogRef.close(dialogResult);
  }

  async onDelete() {
    this.onCancel(true);
  }
}

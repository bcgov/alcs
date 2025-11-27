import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  body: string;
  title?: string;
  yesButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: 'confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
}

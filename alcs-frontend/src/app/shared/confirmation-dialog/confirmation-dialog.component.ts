import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export enum ConfirmationDialogStyle {
  WARN = 'warn',
}

export interface DialogData {
  body: string;
  title?: string;
  yesButtonText?: string;
  cancelButtonText?: string;
  style?: ConfirmationDialogStyle;
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: 'confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
  ConfirmationDialogStyle = ConfirmationDialogStyle;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}
}

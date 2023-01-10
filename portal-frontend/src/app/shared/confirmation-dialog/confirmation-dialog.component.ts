import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  body: string;
  confirmAction?: string;
  cancelAction?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: 'confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
  confirmAction = 'Confirm';
  cancelAction = 'Cancel';

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    if (this.data.confirmAction) {
      this.confirmAction = this.data.confirmAction;
    }
    if (this.data.cancelAction) {
      this.cancelAction = this.data.cancelAction;
    }
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-submit-confirmation-dialog',
  templateUrl: './submit-confirmation-dialog.component.html',
  styleUrls: ['./submit-confirmation-dialog.component.scss'],
})
export class SubmitConfirmationDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    protected data: {
      governmentName: string;
      userIsGovernment: boolean;
    }
  ) {}
}

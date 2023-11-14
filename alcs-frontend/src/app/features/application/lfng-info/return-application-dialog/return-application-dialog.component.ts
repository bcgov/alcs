import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationSubmissionService } from '../../../../services/application/application-submission/application-submission.service';

export enum ReturnApplicationStepEnum {
  comment = 0,
  confirmation = 1,
}

@Component({
  selector: 'app-return-application-dialog',
  templateUrl: './return-application-dialog.component.html',
  styleUrls: ['./return-application-dialog.component.scss'],
})
export class ReturnApplicationDialogComponent {
  fileNumber: string;

  commentStep = ReturnApplicationStepEnum.comment;
  confirmationStep = ReturnApplicationStepEnum.confirmation;

  stepIdx = 0;
  commentForLfng = '';

  constructor(
    private dialogRef: MatDialogRef<ReturnApplicationDialogComponent>,
    private applicationSubmissionService: ApplicationSubmissionService,
    @Inject(MAT_DIALOG_DATA) public data: ReturnApplicationDialogComponent,
  ) {
    this.fileNumber = data.fileNumber;
  }

  async onSubmit() {
    await this.applicationSubmissionService.returnToLfng(this.fileNumber, this.commentForLfng);
    this.dialogRef.close(true);
  }

  async next() {
    this.stepIdx += 1;
  }

  async back() {
    this.stepIdx -= 1;
  }
}

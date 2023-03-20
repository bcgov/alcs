import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationSubmissionReviewService } from '../../../services/application-submission-review/application-submission-review.service';

export enum ReturnApplicationStepEnum {
  reason = 0,
  comment = 1,
  confirmation = 2,
}

@Component({
  selector: 'app-return-application-dialog',
  templateUrl: './return-application-dialog.component.html',
  styleUrls: ['./return-application-dialog.component.scss'],
})
export class ReturnApplicationDialogComponent implements OnInit {
  fileId: string;

  reasonStep = ReturnApplicationStepEnum.reason;
  commentStep = ReturnApplicationStepEnum.comment;
  confirmationStep = ReturnApplicationStepEnum.confirmation;

  isWrongGovernment = false;
  isIncompleteApplication = false;
  stepIdx = 0;
  applicantComment = '';

  constructor(
    private dialogRef: MatDialogRef<ReturnApplicationDialogComponent>,
    private applicationReviewService: ApplicationSubmissionReviewService,
    @Inject(MAT_DIALOG_DATA) public data: ReturnApplicationDialogComponent
  ) {
    this.fileId = data.fileId;
  }

  ngOnInit(): void {}

  onCancel(dialogResult: boolean = false) {
    this.dialogRef.close(dialogResult);
  }

  setToggle(isWrongGovernment: boolean) {
    this.isWrongGovernment = isWrongGovernment;
    this.isIncompleteApplication = !isWrongGovernment;
  }

  async onSubmit() {
    await this.applicationReviewService.returnApplication(this.fileId, {
      reasonForReturn: this.isWrongGovernment ? 'wrongGovernment' : 'incomplete',
      applicantComment: this.applicantComment,
    });
    this.onCancel(true);
  }

  async next() {
    this.stepIdx += 1;
  }

  async back() {
    this.stepIdx -= 1;
  }
}

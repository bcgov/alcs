import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoticeOfIntentParcelService } from '../../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';

export enum NotificationParcelDeleteStepsEnum {
  warning = 0,
  confirmation = 1,
}

@Component({
  selector: 'app-delete-parcel-dialog',
  templateUrl: './delete-parcel-dialog.component.html',
  styleUrls: ['./delete-parcel-dialog.component.scss'],
})
export class DeleteParcelDialogComponent {
  parcelUuid!: string;
  parcelNumber!: string;

  stepIdx = 0;

  warningStep = NotificationParcelDeleteStepsEnum.warning;
  confirmationStep = NotificationParcelDeleteStepsEnum.confirmation;

  constructor(
    private noticeOfIntentParcelService: NoticeOfIntentParcelService,
    private dialogRef: MatDialogRef<DeleteParcelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteParcelDialogComponent
  ) {
    this.parcelUuid = data.parcelUuid;
    this.parcelNumber = data.parcelNumber;
  }

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
    const result = await this.noticeOfIntentParcelService.deleteMany([this.parcelUuid]);

    if (result) {
      this.onCancel(true);
    }
  }
}

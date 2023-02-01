import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';

export enum ApplicationParcelDeleteStepsEnum {
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

  warningStep = ApplicationParcelDeleteStepsEnum.warning;
  confirmationStep = ApplicationParcelDeleteStepsEnum.confirmation;

  constructor(
    private applicationParcelService: ApplicationParcelService,
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
    const result = await this.applicationParcelService.delete(this.parcelUuid);
    if (result) {
      this.onCancel(true);
    }
  }
}

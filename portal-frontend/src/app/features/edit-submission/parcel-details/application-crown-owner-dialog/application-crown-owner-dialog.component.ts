import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  APPLICATION_OWNER,
  ApplicationOwnerCreateDto,
  ApplicationOwnerDto,
  ApplicationOwnerUpdateDto,
} from '../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';

@Component({
  selector: 'app-application-crown-owner-dialog',
  templateUrl: './application-crown-owner-dialog.component.html',
  styleUrls: ['./application-crown-owner-dialog.component.scss'],
})
export class ApplicationCrownOwnerDialogComponent {
  ministryName = new FormControl<string | null>('', [Validators.required]);
  firstName = new FormControl<string | null>('', [Validators.required]);
  lastName = new FormControl<string | null>('', [Validators.required]);
  phoneNumber = new FormControl<string | null>('', [Validators.required]);
  email = new FormControl<string | null>('', [Validators.required, Validators.email]);

  isEdit = false;
  existingUuid: string | undefined;

  form = new FormGroup({
    ministryName: this.ministryName,
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    email: this.email,
  });

  constructor(
    private dialogRef: MatDialogRef<ApplicationCrownOwnerDialogComponent>,
    private appOwnerService: ApplicationOwnerService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      submissionUuid: string;
      fileId: string;
      parcelUuid?: string;
      existingOwner?: ApplicationOwnerDto;
    }
  ) {
    if (data && data.existingOwner) {
      this.isEdit = true;
      this.firstName.setValue(data.existingOwner.firstName);
      this.lastName.setValue(data.existingOwner.lastName);
      this.ministryName.setValue(data.existingOwner.organizationName);
      this.phoneNumber.setValue(data.existingOwner.phoneNumber);
      this.email.setValue(data.existingOwner.email);
      this.existingUuid = data.existingOwner.uuid;
    }
  }

  async onCreate() {
    const createDto: ApplicationOwnerCreateDto = {
      organizationName: this.ministryName.getRawValue() || undefined,
      firstName: this.firstName.getRawValue() || undefined,
      lastName: this.lastName.getRawValue() || undefined,
      email: this.email.getRawValue()!,
      phoneNumber: this.phoneNumber.getRawValue()!,
      typeCode: APPLICATION_OWNER.CROWN,
      applicationSubmissionUuid: this.data.submissionUuid,
    };

    const res = await this.appOwnerService.create(createDto);
    this.dialogRef.close(res);
  }

  async onClose() {
    this.dialogRef.close();
  }

  async onSave() {
    const updateDto: ApplicationOwnerUpdateDto = {
      organizationName: this.ministryName.getRawValue(),
      firstName: this.firstName.getRawValue(),
      lastName: this.lastName.getRawValue(),
      email: this.email.getRawValue()!,
      phoneNumber: this.phoneNumber.getRawValue()!,
      typeCode: APPLICATION_OWNER.CROWN,
    };
    if (this.existingUuid) {
      const res = await this.appOwnerService.update(this.existingUuid, updateDto);
      this.dialogRef.close(res);
    }
  }
}

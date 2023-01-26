import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  APPLICATION_OWNER_TYPE,
  ApplicationOwnerCreateDto,
  ApplicationOwnerDto,
  ApplicationOwnerUpdateDto,
} from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';

@Component({
  selector: 'app-application-owner-dialog',
  templateUrl: './application-owner-dialog.component.html',
  styleUrls: ['./application-owner-dialog.component.scss'],
})
export class ApplicationOwnerDialogComponent {
  OWNER_TYPE = APPLICATION_OWNER_TYPE;
  type = new FormControl<string | null>(APPLICATION_OWNER_TYPE.INDIVIDUAL);
  firstName = new FormControl<string | null>('', [Validators.required]);
  lastName = new FormControl<string | null>('', [Validators.required]);
  organizationName = new FormControl<string | null>('');
  phoneNumber = new FormControl<string | null>('', [Validators.required]);
  email = new FormControl<string | null>('', [Validators.required, Validators.email]);

  isEdit = false;
  existingUuid: string | undefined;

  form = new FormGroup({
    type: this.type,
    firstName: this.firstName,
    lastName: this.lastName,
    organizationName: this.organizationName,
    phoneNumber: this.phoneNumber,
    email: this.email,
  });

  constructor(
    private dialogRef: MatDialogRef<ApplicationOwnerDialogComponent>,
    private appOwnerService: ApplicationOwnerService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileId?: string;
      parcelUuid?: string;
      existingOwner?: ApplicationOwnerDto;
    }
  ) {
    if (data && data.existingOwner) {
      this.onChangeType({
        value: data.existingOwner.type.code,
      } as any);
      this.isEdit = true;
      this.type.setValue(data.existingOwner.type.code);
      this.firstName.setValue(data.existingOwner.firstName);
      this.lastName.setValue(data.existingOwner.lastName);
      this.organizationName.setValue(data.existingOwner.organizationName);
      this.phoneNumber.setValue(data.existingOwner.phoneNumber);
      this.email.setValue(data.existingOwner.email);
      this.existingUuid = data.existingOwner.uuid;
    }
  }

  onChangeType($event: MatButtonToggleChange) {
    if ($event.value === APPLICATION_OWNER_TYPE.ORGANIZATION) {
      this.organizationName.setValidators([Validators.required]);
      this.firstName.setValidators([]);
      this.lastName.setValidators([]);
      this.firstName.reset();
      this.lastName.reset();
    } else {
      this.organizationName.setValidators([]);
      this.firstName.setValidators([Validators.required]);
      this.lastName.setValidators([Validators.required]);
      this.organizationName.reset();
    }
  }

  async onCreate() {
    if (!this.data.fileId) {
      console.error('ApplicationOwnerDialogComponent misconfigured, needs fileId for create');
      return;
    }
    const createDto: ApplicationOwnerCreateDto = {
      organizationName: this.organizationName.getRawValue() || undefined,
      firstName: this.firstName.getRawValue() || undefined,
      lastName: this.lastName.getRawValue() || undefined,
      email: this.email.getRawValue()!,
      phoneNumber: this.phoneNumber.getRawValue()!,
      typeCode: this.type.getRawValue()!,
      applicationFileId: this.data.fileId,
      parcelUuid: this.data.parcelUuid!,
    };

    await this.appOwnerService.create(createDto);
    this.dialogRef.close(true);
  }

  async onClose() {
    this.dialogRef.close(false);
  }

  async onSave() {
    const updateDto: ApplicationOwnerUpdateDto = {
      organizationName: this.organizationName.getRawValue(),
      firstName: this.firstName.getRawValue(),
      lastName: this.lastName.getRawValue(),
      email: this.email.getRawValue()!,
      phoneNumber: this.phoneNumber.getRawValue()!,
      typeCode: this.type.getRawValue()!,
    };
    if (this.existingUuid) {
      await this.appOwnerService.update(this.existingUuid, updateDto);
      this.dialogRef.close(true);
    }
  }
}

import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  NotificationTransfereeCreateDto,
  NotificationTransfereeDto,
  NotificationTransfereeUpdateDto,
} from '../../../../../services/notification-transferee/notification-transferee.dto';
import { NotificationTransfereeService } from '../../../../../services/notification-transferee/notification-transferee.service';
import { OWNER_TYPE } from '../../../../../shared/dto/owner.dto';

@Component({
  selector: 'app-transferee-dialog',
  templateUrl: './transferee-dialog.component.html',
  styleUrls: ['./transferee-dialog.component.scss'],
})
export class TransfereeDialogComponent {
  OWNER_TYPE = OWNER_TYPE;
  type = new FormControl<string | null>(OWNER_TYPE.INDIVIDUAL);
  firstName = new FormControl<string | null>('', [Validators.required]);
  lastName = new FormControl<string | null>('', [Validators.required]);
  organizationName = new FormControl<string | null>('');
  phoneNumber = new FormControl<string | null>('', [Validators.required]);
  email = new FormControl<string | null>('', [Validators.required, Validators.email]);

  isEdit = false;
  isLoading = false;
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
    private dialogRef: MatDialogRef<TransfereeDialogComponent>,
    private transfereeService: NotificationTransfereeService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      submissionUuid: string;
      existingTransferee?: NotificationTransfereeDto;
    }
  ) {
    if (data && data.existingTransferee) {
      this.onChangeType({
        value: data.existingTransferee.type.code,
      } as any);
      this.isEdit = true;
      this.type.setValue(data.existingTransferee.type.code);
      this.firstName.setValue(data.existingTransferee.firstName);
      this.lastName.setValue(data.existingTransferee.lastName);
      this.organizationName.setValue(data.existingTransferee.organizationName);
      this.phoneNumber.setValue(data.existingTransferee.phoneNumber);
      this.email.setValue(data.existingTransferee.email);
      this.existingUuid = data.existingTransferee.uuid;
    }
  }

  onChangeType($event: MatButtonToggleChange) {
    if ($event.value === OWNER_TYPE.ORGANIZATION) {
      this.organizationName.setValidators([Validators.required]);
    } else {
      this.organizationName.setValidators([]);
      this.organizationName.reset();
    }
  }

  async onCreate() {
    if (this.form.valid) {
      if (!this.data.submissionUuid) {
        console.error('TransfereeDialogComponent misconfigured, needs submissionUuid for create');
        return;
      }
      this.isLoading = true;

      const createDto: NotificationTransfereeCreateDto = {
        organizationName: this.organizationName.getRawValue() || undefined,
        firstName: this.firstName.getRawValue() || undefined,
        lastName: this.lastName.getRawValue() || undefined,
        email: this.email.getRawValue()!,
        phoneNumber: this.phoneNumber.getRawValue()!,
        typeCode: this.type.getRawValue()!,
        notificationSubmissionUuid: this.data.submissionUuid,
      };

      await this.transfereeService.create(createDto);
      this.dialogRef.close(true);
    }
  }

  async onClose() {
    this.dialogRef.close(false);
  }

  async onSave() {
    if (this.form.valid) {
      const updateDto: NotificationTransfereeUpdateDto = {
        organizationName: this.organizationName.getRawValue(),
        firstName: this.firstName.getRawValue(),
        lastName: this.lastName.getRawValue(),
        email: this.email.getRawValue()!,
        phoneNumber: this.phoneNumber.getRawValue()!,
        typeCode: this.type.getRawValue()!,
      };
      if (this.existingUuid) {
        this.isLoading = true;
        await this.transfereeService.update(this.existingUuid, updateDto);
        this.dialogRef.close(true);
      }
    }
  }
}

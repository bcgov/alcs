import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationOwnerCreateDto,
  ApplicationOwnerDto,
  ApplicationOwnerUpdateDto,
} from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import {
  NoticeOfIntentOwnerCreateDto,
  NoticeOfIntentOwnerDto,
  NoticeOfIntentOwnerUpdateDto,
} from '../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { OWNER_TYPE } from '../../dto/owner.dto';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-crown-owner-dialog',
  templateUrl: './crown-owner-dialog.component.html',
  styleUrls: ['./crown-owner-dialog.component.scss'],
})
export class CrownOwnerDialogComponent {
  ministryName = new FormControl<string | null>('', [Validators.required]);
  firstName = new FormControl<string | null>('', [Validators.required]);
  lastName = new FormControl<string | null>('', [Validators.required]);
  phoneNumber = new FormControl<string | null>('', [Validators.required]);
  email = new FormControl<string | null>('', [Validators.required, Validators.email]);
  crownLandOwnerType = new FormControl<string | null>('', [Validators.required]);
  @Output() crownlandOwnerChanged = new EventEmitter<string | null>();

  isEdit = false;
  existingUuid: string | undefined;

  form = new FormGroup({
    ministryName: this.ministryName,
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    email: this.email,
    crownLandOwnerType: this.crownLandOwnerType,
  });

  constructor(
    private dialogRef: MatDialogRef<CrownOwnerDialogComponent>,
    private confDialogService: ConfirmationDialogService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      submissionUuid: string;
      fileId: string;
      parcelUuid?: string;
      ownerService: ApplicationOwnerService | NoticeOfIntentOwnerService;
      existingOwner?: ApplicationOwnerDto | NoticeOfIntentOwnerDto;
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
      this.crownLandOwnerType.setValue(data.existingOwner.crownLandOwnerType ?? '');
    }
  }

  async onCreate() {
    const createDto: ApplicationOwnerCreateDto & NoticeOfIntentOwnerCreateDto = {
      organizationName: this.ministryName.getRawValue() || undefined,
      firstName: this.firstName.getRawValue() || undefined,
      lastName: this.lastName.getRawValue() || undefined,
      email: this.email.getRawValue()!,
      phoneNumber: this.phoneNumber.getRawValue()!,
      typeCode: OWNER_TYPE.CROWN,
      applicationSubmissionUuid: this.data.submissionUuid,
      noticeOfIntentSubmissionUuid: this.data.submissionUuid,
      crownLandOwnerType: this.crownLandOwnerType.getRawValue(),
    };

    const res = await this.data.ownerService.create(createDto);
    this.dialogRef.close({ ...res});
  }

  async onClose() {
    this.dialogRef.close();
  }

  async onChangeType($event: MatButtonToggleChange) { 
    this.crownlandOwnerChanged.emit($event.value);
  }

  async onDelete() {
    this.confDialogService
    .openDialog({
      body: `This action will remove ${this.firstName.value} ${this.lastName.value} and its usage from the entire application. Are you sure you want to remove this owner? `,
    })
    .subscribe(async (didConfirm) => {
      if (didConfirm) {
        const res = await this.data.ownerService.delete(this.existingUuid ?? '');        
        this.dialogRef.close({...res, type:'delete' });
      }
    });
  }

  async onSave() {
    const updateDto: ApplicationOwnerUpdateDto & NoticeOfIntentOwnerUpdateDto = {
      organizationName: this.ministryName.getRawValue(),
      firstName: this.firstName.getRawValue(),
      lastName: this.lastName.getRawValue(),
      email: this.email.getRawValue()!,
      phoneNumber: this.phoneNumber.getRawValue()!,
      typeCode: OWNER_TYPE.CROWN,
      crownLandOwnerType: this.crownLandOwnerType.getRawValue(),
    };
    if (this.existingUuid) {
      const res = await this.data.ownerService.update(this.existingUuid, updateDto);
      this.dialogRef.close({...res, type:'update'});
    }
  }
}

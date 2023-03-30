import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDocumentDto,
  ApplicationDocumentTypeDto,
  DOCUMENT_TYPE,
} from '../../../../services/application-document/application-document.dto';
import {
  APPLICATION_OWNER,
  ApplicationOwnerCreateDto,
  ApplicationOwnerDto,
  ApplicationOwnerUpdateDto,
} from '../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import { CodeService } from '../../../../services/code/code.service';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';

@Component({
  selector: 'app-application-owner-dialog',
  templateUrl: './application-owner-dialog.component.html',
  styleUrls: ['./application-owner-dialog.component.scss'],
})
export class ApplicationOwnerDialogComponent {
  OWNER_TYPE = APPLICATION_OWNER;
  type = new FormControl<string | null>(APPLICATION_OWNER.INDIVIDUAL);
  firstName = new FormControl<string | null>('', [Validators.required]);
  lastName = new FormControl<string | null>('', [Validators.required]);
  organizationName = new FormControl<string | null>('');
  phoneNumber = new FormControl<string | null>('', [Validators.required]);
  email = new FormControl<string | null>('', [Validators.required, Validators.email]);
  corporateSummary = new FormControl<string | null>(null);

  isEdit = false;
  existingUuid: string | undefined;
  files: ApplicationDocumentDto[] = [];

  form = new FormGroup({
    type: this.type,
    firstName: this.firstName,
    lastName: this.lastName,
    organizationName: this.organizationName,
    phoneNumber: this.phoneNumber,
    email: this.email,
    corporateSummary: this.corporateSummary,
  });
  private pendingFile: File | undefined;
  private documentCodes: ApplicationDocumentTypeDto[] = [];

  constructor(
    private dialogRef: MatDialogRef<ApplicationOwnerDialogComponent>,
    private appOwnerService: ApplicationOwnerService,
    private codeService: CodeService,
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
      if (data.existingOwner.corporateSummary) {
        this.files.push(data.existingOwner.corporateSummary);
        this.corporateSummary.setValue(data.existingOwner.corporateSummary.uuid);
      }
    }
    this.loadDocumentCodes();
  }

  onChangeType($event: MatButtonToggleChange) {
    if ($event.value === APPLICATION_OWNER.ORGANIZATION) {
      this.organizationName.setValidators([Validators.required]);
      this.corporateSummary.setValidators([Validators.required]);
    } else {
      this.organizationName.setValidators([]);
      this.corporateSummary.setValidators([]);
      this.organizationName.reset();
      this.corporateSummary.reset();
    }
  }

  async onCreate() {
    if (!this.data.fileId) {
      console.error('ApplicationOwnerDialogComponent misconfigured, needs fileId for create');
      return;
    }

    const documentUuid = await this.uploadPendingFile(this.pendingFile);
    const createDto: ApplicationOwnerCreateDto = {
      organizationName: this.organizationName.getRawValue() || undefined,
      firstName: this.firstName.getRawValue() || undefined,
      lastName: this.lastName.getRawValue() || undefined,
      corporateSummaryUuid: documentUuid,
      email: this.email.getRawValue()!,
      phoneNumber: this.phoneNumber.getRawValue()!,
      typeCode: this.type.getRawValue()!,
      applicationFileNumber: this.data.fileId,
    };

    const res = await this.appOwnerService.create(createDto);
    this.dialogRef.close(res);
  }

  async onClose() {
    this.dialogRef.close();
  }

  async onSave() {
    const documentUuid = await this.uploadPendingFile(this.pendingFile);
    const updateDto: ApplicationOwnerUpdateDto = {
      organizationName: this.organizationName.getRawValue(),
      firstName: this.firstName.getRawValue(),
      lastName: this.lastName.getRawValue(),
      corporateSummaryUuid: documentUuid,
      email: this.email.getRawValue()!,
      phoneNumber: this.phoneNumber.getRawValue()!,
      typeCode: this.type.getRawValue()!,
    };
    if (this.existingUuid) {
      const res = await this.appOwnerService.update(this.existingUuid, updateDto);
      this.dialogRef.close(res);
    }
  }

  async attachFile(fileHandle: FileHandle) {
    this.pendingFile = fileHandle.file;
    this.corporateSummary.setValue('pending');
    const corporateSummaryType = this.documentCodes.find((code) => code.code === DOCUMENT_TYPE.CORPORATE_SUMMARY);
    if (corporateSummaryType) {
      this.files = [
        {
          type: corporateSummaryType,
          fileName: this.pendingFile.name,
          fileSize: this.pendingFile.size,
          uuid: '',
          uploadedAt: Date.now(),
          uploadedBy: '',
        },
      ];
    } else {
      console.error('Failed to find document type for Corporate Summary');
    }
  }

  removeCorporateSummary() {
    if (this.pendingFile) {
      this.pendingFile = undefined;
    }
    this.corporateSummary.setValue(null);
    this.files = [];
  }

  async openCorporateSummary() {
    if (this.pendingFile) {
      const fileURL = URL.createObjectURL(this.pendingFile);
      window.open(fileURL, '_blank');
    } else if (this.existingUuid) {
      const res = await this.appOwnerService.openCorporateSummary(this.existingUuid);
      if (res) {
        window.open(res.url, '_blank');
      }
    }
  }

  private async uploadPendingFile(file?: File) {
    let documentUuid;
    if (file) {
      documentUuid = await this.appOwnerService.uploadCorporateSummary(file);
      if (!documentUuid) {
        return;
      }
    }
    return documentUuid;
  }

  private async loadDocumentCodes() {
    const codes = await this.codeService.loadCodes();
    this.documentCodes = codes.applicationDocumentTypes;
  }
}

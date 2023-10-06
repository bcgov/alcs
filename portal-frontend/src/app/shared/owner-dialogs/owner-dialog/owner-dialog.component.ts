import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import {
  ApplicationOwnerCreateDto,
  ApplicationOwnerDto,
  ApplicationOwnerUpdateDto,
} from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { CodeService } from '../../../services/code/code.service';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerCreateDto } from '../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../../dto/document.dto';
import { OWNER_TYPE } from '../../dto/owner.dto';
import { FileHandle } from '../../file-drag-drop/drag-drop.directive';
import { RemoveFileConfirmationDialogComponent } from '../../../features/applications/alcs-edit-submission/remove-file-confirmation-dialog/remove-file-confirmation-dialog.component';

@Component({
  selector: 'app-owner-dialog',
  templateUrl: './owner-dialog.component.html',
  styleUrls: ['./owner-dialog.component.scss'],
})
export class OwnerDialogComponent {
  OWNER_TYPE = OWNER_TYPE;
  type = new FormControl<string | null>(OWNER_TYPE.INDIVIDUAL);
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
  private documentCodes: DocumentTypeDto[] = [];

  constructor(
    private dialogRef: MatDialogRef<OwnerDialogComponent>,
    private codeService: CodeService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileId: string;
      submissionUuid: string;
      isDraft: boolean;
      parcelUuid?: string;
      existingOwner?: ApplicationOwnerDto;
      documentService: ApplicationDocumentService | NoticeOfIntentDocumentService;
      ownerService: ApplicationOwnerService | NoticeOfIntentOwnerService;
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
    if ($event.value === OWNER_TYPE.ORGANIZATION) {
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
    if (this.form.valid) {
      if (!this.data.submissionUuid) {
        console.error('ApplicationOwnerDialogComponent misconfigured, needs fileId for create');
        return;
      }
  
      const documentUuid = await this.uploadPendingFile(this.pendingFile);
      const createDto: ApplicationOwnerCreateDto & NoticeOfIntentOwnerCreateDto = {
        organizationName: this.organizationName.getRawValue() || undefined,
        firstName: this.firstName.getRawValue() || undefined,
        lastName: this.lastName.getRawValue() || undefined,
        corporateSummaryUuid: documentUuid?.uuid,
        email: this.email.getRawValue()!,
        phoneNumber: this.phoneNumber.getRawValue()!,
        typeCode: this.type.getRawValue()!,
        applicationSubmissionUuid: this.data.submissionUuid,
        noticeOfIntentSubmissionUuid: this.data.submissionUuid,
      };
  
      const res = await this.data.ownerService.create(createDto);
      this.dialogRef.close(res);
    } else {
      this.form.markAllAsTouched()
    }
  }

  async onClose() {
    this.dialogRef.close();
  }

  async onSave() {
    if (this.form.valid) {
      const document = await this.uploadPendingFile(this.pendingFile);
      const updateDto: ApplicationOwnerUpdateDto = {
        organizationName: this.organizationName.getRawValue(),
        firstName: this.firstName.getRawValue(),
        lastName: this.lastName.getRawValue(),
        corporateSummaryUuid: document?.uuid,
        email: this.email.getRawValue()!,
        phoneNumber: this.phoneNumber.getRawValue()!,
        typeCode: this.type.getRawValue()!,
      };
      if (this.existingUuid) {
        const res = await this.data.ownerService.update(this.existingUuid, updateDto);
        this.dialogRef.close(res);
      }
    } else {
      this.form.markAllAsTouched()
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
          source: DOCUMENT_SOURCE.APPLICANT,
          uploadedAt: Date.now(),
          uploadedBy: '',
        },
      ];
    } else {
      console.error('Failed to find document type for Corporate Summary');
    }
  }

  removeCorporateSummary() {
    if (this.data.isDraft) {
      this.dialog
        .open(RemoveFileConfirmationDialogComponent)
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm) {
            if (this.pendingFile) {
              this.pendingFile = undefined;
            }
            this.corporateSummary.setValue(null);
            this.files = [];
          }
        });
    } else {
      if (this.pendingFile) {
        this.pendingFile = undefined;
      }
      this.corporateSummary.setValue(null);
      this.files = [];
    }
  }

  async openCorporateSummary() {
    if (this.pendingFile) {
      const fileURL = URL.createObjectURL(this.pendingFile);
      window.open(fileURL, '_blank');
    } else if (this.existingUuid && this.data.existingOwner?.corporateSummary?.uuid) {
      const res = await this.data.documentService.openFile(this.data.existingOwner?.corporateSummary?.uuid);
      if (res) {
        window.open(res.url, '_blank');
      }
    }
  }

  private async uploadPendingFile(file?: File) {
    let documentUuid;
    if (file) {
      documentUuid = await this.data.ownerService.uploadCorporateSummary(this.data.fileId, file);
      if (!documentUuid) {
        return;
      }
    }
    return documentUuid;
  }

  private async loadDocumentCodes() {
    const codes = await this.codeService.loadCodes();
    this.documentCodes = codes.documentTypes;
  }
}

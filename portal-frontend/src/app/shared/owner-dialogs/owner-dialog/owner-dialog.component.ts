import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RemoveFileConfirmationDialogComponent } from '../../../features/applications/alcs-edit-submission/remove-file-confirmation-dialog/remove-file-confirmation-dialog.component';
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
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../../dto/document.dto';
import { OWNER_TYPE } from '../../dto/owner.dto';
import { FileHandle } from '../../file-drag-drop/drag-drop.directive';
import { openFileInline } from '../../utils/file';
import { strictEmailValidator } from '../../validators/email-validator';
import { ToastService } from '../../../services/toast/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-owner-dialog',
    templateUrl: './owner-dialog.component.html',
    styleUrls: ['./owner-dialog.component.scss'],
    standalone: false
})
export class OwnerDialogComponent {
  OWNER_TYPE = OWNER_TYPE;
  type = new FormControl<string | null>(OWNER_TYPE.INDIVIDUAL);
  firstName = new FormControl<string | null>('', [Validators.required]);
  lastName = new FormControl<string | null>('', [Validators.required]);
  organizationName = new FormControl<string | null>('');
  phoneNumber = new FormControl<string | null>('', [Validators.required]);
  email = new FormControl<string | null>('', [Validators.required, strictEmailValidator]);
  corporateSummary = new FormControl<string | null>(null);

  isEdit = false;
  showHasVirusError = false;
  showVirusScanFailedError = false;
  existingUuid: string | undefined;
  files: ApplicationDocumentDto[] = [];
  showFileErrors = false;
  isLoading = false;

  form = new FormGroup({
    type: this.type,
    firstName: this.firstName,
    lastName: this.lastName,
    organizationName: this.organizationName,
    phoneNumber: this.phoneNumber,
    email: this.email,
    corporateSummary: this.corporateSummary,
  });
  pendingFile: FileHandle | undefined;
  private documentCodes: DocumentTypeDto[] = [];

  constructor(
    private dialogRef: MatDialogRef<OwnerDialogComponent>,
    private codeService: CodeService,
    private dialog: MatDialog,
    private confDialogService: ConfirmationDialogService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileId: string;
      submissionUuid: string;
      isDraft: boolean;
      parcelUuid?: string;
      existingOwner?: ApplicationOwnerDto;
      documentService: ApplicationDocumentService | NoticeOfIntentDocumentService;
      ownerService: ApplicationOwnerService | NoticeOfIntentOwnerService;
    },
    private toastService: ToastService,
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
    }
    this.corporateSummary.updateValueAndValidity();
    this.organizationName.updateValueAndValidity();
  }

  async onCreate() {
    if (this.form.valid) {
      if (!this.data.submissionUuid) {
        console.error('ApplicationOwnerDialogComponent misconfigured, needs fileId for create');
        return;
      }

      this.isLoading = true;

      let shouldContinue = false;
      if (this.type.value === OWNER_TYPE.INDIVIDUAL) {
        shouldContinue = await this.removeCorporateSummary();
        if (!shouldContinue) {
          this.isLoading = false;
          return;
        }
      }

      let documentUuid;
      if (this.pendingFile) {
        documentUuid = await this.uploadPendingFile(this.pendingFile.file);
        if (!documentUuid) {
          return;
        }
      }

      const orgName = this.type.value === OWNER_TYPE.ORGANIZATION ? this.organizationName.getRawValue() : null;
      const createDto: ApplicationOwnerCreateDto & NoticeOfIntentOwnerCreateDto = {
        organizationName: orgName,
        firstName: this.firstName.getRawValue() || undefined,
        lastName: this.lastName.getRawValue() || undefined,
        corporateSummaryUuid: documentUuid?.uuid ?? null,
        email: this.email.getRawValue()!,
        phoneNumber: this.phoneNumber.getRawValue()!,
        typeCode: this.type.getRawValue()!,
        applicationSubmissionUuid: this.data.submissionUuid,
        noticeOfIntentSubmissionUuid: this.data.submissionUuid,
      };

      const res = await this.data.ownerService.create(createDto);
      this.isLoading = false;
      this.dialogRef.close({
        ...res,
        action: 'create',
      });
    } else {
      this.form.markAllAsTouched();
      this.showFileErrors = true;
    }
  }

  async onClose() {
    this.dialogRef.close();
  }

  async onDelete() {
    this.confDialogService
      .openDialog({
        title: 'Delete Owner',
        body: `This action will remove ${this.firstName.value} ${this.lastName.value} and its usage from the entire application. Are you sure you want to remove this owner? `,
      })
      .subscribe(async (didConfirm) => {
        if (didConfirm) {
          const res = await this.data.ownerService.delete(this.existingUuid ?? '');
          this.dialogRef.close({
            action: 'delete',
          });
        }
      });
  }

  async onSave() {
    if (this.form.valid) {
      this.isLoading = true;

      let shouldContinue = false;
      if (this.type.value === OWNER_TYPE.INDIVIDUAL) {
        shouldContinue = await this.removeCorporateSummary();

        if (!shouldContinue) {
          this.isLoading = false;
          return;
        }
      }

      let document;
      if (this.pendingFile) {
        document = await this.uploadPendingFile(this.pendingFile.file);
      } else {
        document = this.type.value === OWNER_TYPE.ORGANIZATION ? this.data.existingOwner?.corporateSummary : null;
      }

      const orgName = this.type.value === OWNER_TYPE.ORGANIZATION ? this.organizationName.getRawValue() : null;
      const updateDto: ApplicationOwnerUpdateDto = {
        organizationName: orgName,
        firstName: this.firstName.getRawValue(),
        lastName: this.lastName.getRawValue(),
        corporateSummaryUuid: document?.uuid ?? null,
        email: this.email.getRawValue()!,
        phoneNumber: this.phoneNumber.getRawValue()!,
        typeCode: this.type.getRawValue()!,
      };
      if (this.existingUuid) {
        const res = await this.data.ownerService.update(this.existingUuid, updateDto);
        this.dialogRef.close({
          ...res,
          action: 'edit',
        });
      }
      this.isLoading = false;
    } else {
      this.form.markAllAsTouched();
      this.showFileErrors = true;
    }
  }

  async attachFile(fileHandle: FileHandle) {
    this.pendingFile = fileHandle;
    this.corporateSummary.setValue('pending');
    const corporateSummaryType = this.documentCodes.find((code) => code.code === DOCUMENT_TYPE.CORPORATE_SUMMARY);
    if (corporateSummaryType) {
      this.showHasVirusError = false;
      this.files = [
        {
          type: corporateSummaryType,
          fileName: this.pendingFile.file.name,
          fileSize: this.pendingFile.file.size,
          uuid: '',
          documentUuid: '',
          source: DOCUMENT_SOURCE.APPLICANT,
          uploadedAt: Date.now(),
          uploadedBy: '',
        },
      ];
    } else {
      console.error('Failed to find document type for Corporate Summary');
    }
  }

  removeCorporateSummary(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.data.isDraft && (this.pendingFile || this.files.length > 0)) {
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
              resolve(true); // User confirmed, continue with the operation
            } else {
              resolve(false); // User canceled, don't continue
            }
          });
      } else {
        if (this.pendingFile) {
          this.pendingFile = undefined;
        }
        this.corporateSummary.setValue(null);
        this.files = [];
        resolve(true); // No confirmation dialog needed, continue
      }
    });
  }

  async openCorporateSummary() {
    if (this.pendingFile) {
      const fileURL = URL.createObjectURL(this.pendingFile.file);
      openFileInline(fileURL, this.pendingFile.file.name);
    } else if (this.existingUuid && this.data.existingOwner?.corporateSummary?.uuid) {
      const res = await this.data.documentService.openFile(this.data.existingOwner?.corporateSummary?.uuid);
      if (res) {
        openFileInline(res.url, this.data.existingOwner?.corporateSummary?.fileName);
      }
    }
  }

  private async uploadPendingFile(file?: File) {
    if (file) {
      try {
        const documentUuid = await this.data.ownerService.uploadCorporateSummary(this.data.fileId, file);
        this.toastService.showSuccessToast('Document uploaded');
        this.showHasVirusError = false;
        this.showVirusScanFailedError = false;
        return documentUuid;
      } catch (err) {
        if (err instanceof HttpErrorResponse) {
          this.showHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
          this.showVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
        }
        this.pendingFile = undefined;
        this.corporateSummary.setValue(null);
        this.files = [];
        this.toastService.showErrorToast('Document upload failed');
      }
    }
    return;
  }

  private async loadDocumentCodes() {
    const codes = await this.codeService.loadCodes();
    this.documentCodes = codes.documentTypes;
  }
}

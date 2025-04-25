import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDocumentDto,
  ApplicationDocumentUpdateDto,
} from '../../../../../services/application-document/application-document.dto';
import { ToastService } from '../../../../../services/toast/toast.service';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OtherAttachmentsComponent } from '../other-attachments.component';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../../../../../shared/dto/document.dto';
import { CodeService } from '../../../../../services/code/code.service';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { HttpErrorResponse } from '@angular/common/http';

const USER_CONTROLLED_TYPES = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

@Component({
  selector: 'app-other-attachments-upload-dialog',
  templateUrl: './other-attachments-upload-dialog.component.html',
  styleUrl: './other-attachments-upload-dialog.component.scss',
})
export class OtherAttachmentsUploadDialogComponent implements OnInit {
  isDirty = false;
  isFileDirty = false;
  isSaving = false;
  showHasVirusError = false;
  showVirusScanFailedError = false;
  showFileRequiredError = false;
  title: string = '';
  isEditing = false;

  attachment: ApplicationDocumentDto[] = [];
  attachmentForDelete: ApplicationDocumentDto[] = [];
  pendingFile: FileHandle | undefined;
  selectableTypes: DocumentTypeDto[] = [];
  private documentCodes: DocumentTypeDto[] = [];

  fileDescription = new FormControl<string | null>(null, [Validators.required]);
  fileType = new FormControl<string | null>(null, [Validators.required]);
  currentDescription: string | null = null;
  currentType: DocumentTypeDto | null = null;

  form = new FormGroup({
    fileDescription: this.fileDescription,
    fileType: this.fileType,
  });

  constructor(
    private dialogRef: MatDialogRef<OtherAttachmentsUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      otherAttachmentsComponent: OtherAttachmentsComponent;
      existingDocument?: ApplicationDocumentDto;
      fileId: string;
    },
    private applicationDcoumentService: ApplicationDocumentService,
    private codeService: CodeService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadDocumentCodes();
    if (this.data.existingDocument) {
      this.title = 'Edit';
      this.isEditing = true;
      this.fileType.setValue(this.data.existingDocument.type!.code);
      this.fileDescription.setValue(this.data.existingDocument.description!);
      this.currentDescription = this.data.existingDocument.description!;
      this.currentType = this.data.existingDocument.type;
      this.attachment = [this.data.existingDocument];
    } else {
      this.title = 'Add';
    }
  }

  async attachDocument(file: FileHandle) {
    this.pendingFile = file;
    this.attachment = [
      {
        uuid: '',
        documentUuid: '',
        fileName: file.file.name,
        type: null,
        fileSize: file.file.size,
        uploadedBy: '',
        uploadedAt: file.file.lastModified,
        source: DOCUMENT_SOURCE.APPLICANT,
      },
    ];
    this.isFileDirty = true;
    this.showFileRequiredError = false;
  }

  openFile() {
    if (this.isEditing && this.pendingFile === undefined) {
      this.data.otherAttachmentsComponent.openFile(this.attachment[0]);
    } else {
      if (this.pendingFile) {
        const fileURL = URL.createObjectURL(this.pendingFile.file);
        window.open(fileURL, '_blank');
      }
    }
  }

  deleteFile() {
    this.pendingFile = undefined;
    if (this.isEditing) {
      this.attachmentForDelete = this.attachment;
    }
    this.attachment = [];
  }

  onChangeDescription() {
    this.isDirty = true;
    this.currentDescription = this.fileDescription.value;
  }

  onChangeType(selectedValue: DOCUMENT_TYPE) {
    this.isDirty = true;
    const newType = this.documentCodes.find((code) => code.code === selectedValue);
    this.currentType = newType !== undefined ? newType : null;
  }

  validateForm() {
    if (this.form.valid && this.attachment.length !== 0) {
      return true;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }

    if (this.attachment.length == 0) {
      this.showFileRequiredError = true;
    }
    return false;
  }

  async onAdd() {
    if (this.validateForm()) {
      await this.add();
    }
  }

  protected async add() {
    if (this.isFileDirty) {
      this.isSaving = true;
      try {
        await this.data.otherAttachmentsComponent.attachFile(this.pendingFile!, null);
        this.showHasVirusError = false;
        this.showVirusScanFailedError = false;

        const documents = await this.applicationDcoumentService.getByFileId(this.data.fileId);

        if (documents) {
          const sortedDocuments = documents.sort((a, b) => {
            return b.uploadedAt - a.uploadedAt;
          });
          const updateDtos: ApplicationDocumentUpdateDto[] = sortedDocuments.map((file) => ({
            uuid: file.uuid,
            description: file.description,
            type: file.type?.code ?? null,
          }));
          updateDtos[0] = {
            ...updateDtos[0],
            description: this.currentDescription,
            type: this.currentType?.code ?? null,
          };
          await this.applicationDcoumentService.update(this.data.fileId, updateDtos);
          this.toastService.showSuccessToast('Attachment added successfully');
          this.dialogRef.close();
        } else {
          this.toastService.showErrorToast('Could not read attached documents');
        }
      } catch (err) {
        if (err instanceof HttpErrorResponse) {
          this.showHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
          this.showVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
        }
      }
      this.isDirty = false;
      this.isFileDirty = true;
      this.isSaving = false;
    }
  }

  async onEdit() {
    if (this.validateForm()) {
      this.edit();
    }
  }

  protected async edit() {
    if (this.isFileDirty) {
      this.data.otherAttachmentsComponent.onDeleteFile(this.attachmentForDelete[0]);
      await this.add();
    } else {
      if (this.isDirty) {
        this.isSaving = true;
        const documents = await this.applicationDcoumentService.getByFileId(this.data.fileId);
        if (documents) {
          const updateDtos: ApplicationDocumentUpdateDto[] = documents.map((file) => ({
            uuid: file.uuid,
            description: file.description,
            type: file.type?.code ?? null,
          }));
          for (let i = 0; i < updateDtos.length; i++) {
            if (updateDtos[i].uuid === this.data.existingDocument?.uuid) {
              updateDtos[i] = {
                ...updateDtos[i],
                description: this.currentDescription,
                type: this.currentType?.code ?? null,
              };
            }
          }
          await this.applicationDcoumentService.update(this.data.fileId, updateDtos);
          this.toastService.showSuccessToast('Attachment updated successully');
        } else {
          this.toastService.showErrorToast('Could not read attached documents');
        }
      }
      this.dialogRef.close();
    }
  }

  private async loadDocumentCodes() {
    const codes = await this.codeService.loadCodes();
    this.documentCodes = codes.documentTypes;
    this.selectableTypes = this.documentCodes.filter((code) => USER_CONTROLLED_TYPES.includes(code.code));
  }
}

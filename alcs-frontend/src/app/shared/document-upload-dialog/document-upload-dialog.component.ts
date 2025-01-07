import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionDocumentDto } from '../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ToastService } from '../../services/toast/toast.service';
import { DOCUMENT_SOURCE } from '../document/document.dto';
import { FileHandle } from '../drag-drop-file/drag-drop-file.directive';
import { splitExtension } from '../utils/file';
import { DecisionService } from './document-upload.interface';

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss'],
})
export class DocumentUploadDialogComponent implements OnInit {
  title = 'Create';
  isDirty = false;
  isSaving = false;
  allowsFileEdit = true;
  documentType = 'Decision Package';

  @Output() uploadFiles: EventEmitter<FileHandle> = new EventEmitter();

  name = new FormControl<string>('', [Validators.required]);
  type = new FormControl<string | undefined>({ disabled: true, value: undefined }, [Validators.required]);
  source = new FormControl<string>({ disabled: true, value: DOCUMENT_SOURCE.ALC }, [Validators.required]);

  visibleToInternal = new FormControl<boolean>({ disabled: true, value: true }, [Validators.required]);
  visibleToPublic = new FormControl<boolean>({ disabled: true, value: true }, [Validators.required]);

  documentSources = Object.values(DOCUMENT_SOURCE);

  form = new FormGroup({
    name: this.name,
    type: this.type,
    source: this.source,
    visibleToInternal: this.visibleToInternal,
    visibleToPublic: this.visibleToPublic,
  });

  pendingFile: File | undefined;
  existingFile: string | undefined;
  showVirusError = false;
  extension = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileId: string;
      decisionUuid: string;
      existingDocument?: ApplicationDecisionDocumentDto;
      decisionService: DecisionService;
    },
    protected dialog: MatDialogRef<any>,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    if (this.data.existingDocument) {
      const document = this.data.existingDocument;
      this.title = 'Edit';

      const { fileName, extension } = splitExtension(document.fileName);
      this.extension = extension;
      this.form.patchValue({
        name: fileName,
      });
      this.existingFile = document.fileName;
    }
  }

  async onSubmit() {
    const file = this.pendingFile;
    if (file) {
      const renamedFile = new File([file], this.name.value! + this.extension, { type: file.type });
      this.isSaving = true;
      if (this.data.existingDocument) {
        await this.data.decisionService.deleteFile(this.data.decisionUuid, this.data.existingDocument.uuid);
      }

      try {
        await this.data.decisionService.uploadFile(this.data.decisionUuid, renamedFile);
      } catch (err) {
        this.toastService.showErrorToast('Document upload failed');
        if (err instanceof HttpErrorResponse && err.status === 403) {
          this.showVirusError = true;
          this.isSaving = false;
          this.pendingFile = undefined;
          return;
        }
      }

      this.dialog.close(true);
      this.isSaving = false;
    } else if (this.data.existingDocument) {
      this.isSaving = true;
      await this.data.decisionService.updateFile(
        this.data.decisionUuid,
        this.data.existingDocument.uuid,
        this.name.value! + this.extension,
      );

      this.dialog.close(true);
      this.isSaving = false;
    }
  }

  uploadFile(event: Event) {
    const element = event.target as HTMLInputElement;
    const selectedFiles = element.files;
    if (selectedFiles && selectedFiles[0]) {
      this.pendingFile = selectedFiles[0];
      const { fileName, extension } = splitExtension(selectedFiles[0].name);
      this.name.setValue(fileName);
      this.extension = extension;
      this.showVirusError = false;
    }
  }

  onRemoveFile() {
    this.pendingFile = undefined;
    this.existingFile = undefined;
    this.extension = '';
    this.name.setValue('');
  }

  openFile() {
    if (this.pendingFile) {
      const fileURL = URL.createObjectURL(this.pendingFile);
      window.open(fileURL, '_blank');
    }
  }

  async openExistingFile() {
    if (this.data.existingDocument) {
      await this.data.decisionService.downloadFile(
        this.data.decisionUuid,
        this.data.existingDocument.uuid,
        this.data.existingDocument.fileName,
        true,
      );
    }
  }

  filesDropped($event: FileHandle) {
    this.pendingFile = $event.file;
    const { fileName, extension } = splitExtension(this.pendingFile.name);
    this.extension = extension;
    this.name.setValue(fileName);
    this.showVirusError = false;
    this.uploadFiles.emit($event);
  }
}

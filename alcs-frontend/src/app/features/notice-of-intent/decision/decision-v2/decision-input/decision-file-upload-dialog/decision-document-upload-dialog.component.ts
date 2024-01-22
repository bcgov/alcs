import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoticeOfIntentDecisionV2Service } from '../../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-v2.service';
import { NoticeOfIntentDecisionDocumentDto } from '../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { DOCUMENT_SOURCE } from '../../../../../../shared/document/document.dto';

@Component({
  selector: 'app-noi-decision-document-upload-dialog',
  templateUrl: './decision-document-upload-dialog.component.html',
  styleUrls: ['./decision-document-upload-dialog.component.scss'],
})
export class DecisionDocumentUploadDialogComponent implements OnInit {
  title = 'Create';
  isDirty = false;
  isSaving = false;
  allowsFileEdit = true;
  documentType = 'Decision Package';

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

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { fileId: string; decisionUuid: string; existingDocument?: NoticeOfIntentDecisionDocumentDto },
    protected dialog: MatDialogRef<any>,
    private decisionService: NoticeOfIntentDecisionV2Service,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    if (this.data.existingDocument) {
      const document = this.data.existingDocument;
      this.title = 'Edit';
      this.form.patchValue({
        name: document.fileName,
      });
      this.existingFile = document.fileName;
    }
  }

  async onSubmit() {
    const file = this.pendingFile;
    if (file) {
      const renamedFile = new File([file], this.name.value ?? file.name);
      this.isSaving = true;
      if (this.data.existingDocument) {
        await this.decisionService.deleteFile(this.data.decisionUuid, this.data.existingDocument.uuid);
      }

      try {
        await this.decisionService.uploadFile(this.data.decisionUuid, renamedFile);
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
      await this.decisionService.updateFile(this.data.decisionUuid, this.data.existingDocument.uuid, this.name.value!);

      this.dialog.close(true);
      this.isSaving = false;
    }
  }

  uploadFile(event: Event) {
    const element = event.target as HTMLInputElement;
    const selectedFiles = element.files;
    if (selectedFiles && selectedFiles[0]) {
      this.pendingFile = selectedFiles[0];
      this.name.setValue(selectedFiles[0].name);
      this.showVirusError = false;
    }
  }

  onRemoveFile() {
    this.pendingFile = undefined;
    this.existingFile = undefined;
  }

  openFile() {
    if (this.pendingFile) {
      const fileURL = URL.createObjectURL(this.pendingFile);
      window.open(fileURL, '_blank');
    }
  }

  async openExistingFile() {
    if (this.data.existingDocument) {
      await this.decisionService.downloadFile(
        this.data.decisionUuid,
        this.data.existingDocument.uuid,
        this.data.existingDocument.fileName,
      );
    }
  }
}

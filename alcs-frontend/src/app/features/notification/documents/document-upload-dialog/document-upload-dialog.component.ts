import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { UpdateNoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent/noi-document/noi-document.dto';
import { NotificationDocumentDto } from '../../../../services/notification/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../../services/notification/notification-document/notification-document.service';
import { ToastService } from '../../../../services/toast/toast.service';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
  DOCUMENT_TYPE,
  DocumentTypeDto,
} from '../../../../shared/document/document.dto';

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss'],
})
export class DocumentUploadDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  DOCUMENT_TYPE = DOCUMENT_TYPE;

  title = 'Create';
  isDirty = false;
  isSaving = false;
  allowsFileEdit = true;
  documentTypeAhead: string | undefined = undefined;

  name = new FormControl<string>('', [Validators.required]);
  type = new FormControl<string | undefined>(undefined, [Validators.required]);
  source = new FormControl<string>('', [Validators.required]);

  visibleToInternal = new FormControl<boolean>(false, [Validators.required]);
  visibleToPublic = new FormControl<boolean>(false, [Validators.required]);

  documentTypes: DocumentTypeDto[] = [];
  documentSources = Object.values(DOCUMENT_SOURCE);

  form = new FormGroup({
    name: this.name,
    type: this.type,
    source: this.source,
    visibleToInternal: this.visibleToInternal,
    visibleToPublic: this.visibleToPublic,
  });

  pendingFile: File | undefined;
  existingFile: { name: string; size: number } | undefined;
  showVirusError = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { fileId: string; existingDocument?: NotificationDocumentDto },
    protected dialog: MatDialogRef<any>,
    private notificationDocumentService: NotificationDocumentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();

    if (this.data.existingDocument) {
      const document = this.data.existingDocument;
      this.title = 'Edit';
      this.allowsFileEdit = document.system === DOCUMENT_SYSTEM.ALCS;

      this.form.patchValue({
        name: document.fileName,
        type: document.type?.code,
        source: document.source,
        visibleToInternal: document.visibilityFlags.includes('A'),
        visibleToPublic: document.visibilityFlags.includes('P'),
      });
      this.documentTypeAhead = document.type!.code;
      this.existingFile = {
        name: document.fileName,
        size: 0,
      };
    }
  }

  async onSubmit() {
    const visibilityFlags: ('A' | 'G' | 'P')[] = [];

    if (this.visibleToInternal.getRawValue()) {
      visibilityFlags.push('A');
      visibilityFlags.push('G');
    }

    if (this.visibleToPublic.getRawValue()) {
      visibilityFlags.push('P');
    }

    const dto: UpdateNoticeOfIntentDocumentDto = {
      fileName: this.name.value!,
      source: this.source.value as DOCUMENT_SOURCE,
      typeCode: this.type.value as DOCUMENT_TYPE,
      visibilityFlags,
    };

    const file = this.pendingFile;
    this.isSaving = true;
    if (this.data.existingDocument) {
      await this.notificationDocumentService.update(this.data.existingDocument.uuid, dto);
    } else if (file !== undefined) {
      try {
        await this.notificationDocumentService.upload(this.data.fileId, {
          ...dto,
          file,
        });
      } catch (err) {
        this.toastService.showErrorToast('Document upload failed');
        if (err instanceof HttpErrorResponse && err.status === 403) {
          this.showVirusError = true;
          this.isSaving = false;
          this.pendingFile = undefined;
          return;
        }
      }
    }
    this.dialog.close(true);
    this.isSaving = false;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  filterDocumentTypes(term: string, item: DocumentTypeDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.label.toLocaleLowerCase().indexOf(termLower) > -1 ||
      item.oatsCode.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  async onDocTypeSelected($event?: DocumentTypeDto) {
    if ($event) {
      this.type.setValue($event.code);
    } else {
      this.type.setValue(undefined);
    }
  }

  uploadFile(event: Event) {
    const element = event.target as HTMLInputElement;
    const selectedFiles = element.files;
    if (selectedFiles && selectedFiles[0]) {
      this.pendingFile = selectedFiles[0];
      this.name.setValue(selectedFiles[0].name);
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
      await this.notificationDocumentService.download(
        this.data.existingDocument.uuid,
        this.data.existingDocument.fileName
      );
    }
  }

  private async loadDocumentTypes() {
    const docTypes = await this.notificationDocumentService.fetchTypes();
    docTypes.sort((a, b) => (a.label > b.label ? 1 : -1));
    this.documentTypes = docTypes.filter((type) => type.code !== DOCUMENT_TYPE.ORIGINAL_APPLICATION);
  }
}

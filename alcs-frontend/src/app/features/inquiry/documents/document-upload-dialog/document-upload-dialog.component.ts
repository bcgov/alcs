import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import {
  InquiryDocumentDto,
  UpdateDocumentDto,
} from '../../../../services/inquiry/inquiry-document/inquiry-document.dto';
import { InquiryDocumentService } from '../../../../services/inquiry/inquiry-document/inquiry-document.service';
import { ToastService } from '../../../../services/toast/toast.service';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
  DOCUMENT_TYPE,
  DocumentTypeDto,
} from '../../../../shared/document/document.dto';
import { splitExtension } from '../../../../shared/utils/file';

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

  documentTypes: DocumentTypeDto[] = [];
  documentSources = Object.values(DOCUMENT_SOURCE);

  form = new FormGroup({
    name: this.name,
    type: this.type,
    source: this.source,
  });

  pendingFile: File | undefined;
  existingFile: { name: string; size: number } | undefined;
  showVirusError = false;
  extension = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { fileId: string; existingDocument?: InquiryDocumentDto },
    protected dialog: MatDialogRef<any>,
    private inquiryDocumentService: InquiryDocumentService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();

    if (this.data.existingDocument) {
      const document = this.data.existingDocument;
      this.title = 'Edit';
      this.allowsFileEdit = document.system === DOCUMENT_SYSTEM.ALCS;
      const { fileName, extension } = splitExtension(document.fileName);
      this.extension = extension;

      this.form.patchValue({
        name: fileName,
        type: document.type?.code,
        source: document.source,
      });
      this.documentTypeAhead = document.type!.code;

      this.existingFile = {
        name: document.fileName,
        size: 0,
      };
    }
  }

  async onSubmit() {
    const file = this.pendingFile;
    const dto: UpdateDocumentDto = {
      fileName: this.name.value! + this.extension,
      source: this.source.value as DOCUMENT_SOURCE,
      typeCode: this.type.value as DOCUMENT_TYPE,
      file,
    };

    this.isSaving = true;
    if (this.data.existingDocument) {
      await this.inquiryDocumentService.update(this.data.existingDocument.uuid, dto);
    } else if (file !== undefined) {
      try {
        await this.inquiryDocumentService.upload(this.data.fileId, {
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
      this.showVirusError = false;
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

      const documentName = selectedFiles[0].name;
      const { fileName, extension } = splitExtension(documentName);
      this.name.setValue(fileName);
      this.extension = extension;
      this.showVirusError = false;
    }
  }

  onRemoveFile() {
    this.pendingFile = undefined;
    this.existingFile = undefined;
    this.extension = '';
  }

  openFile() {
    if (this.pendingFile) {
      const fileURL = URL.createObjectURL(this.pendingFile);
      window.open(fileURL, '_blank');
    }
  }

  async openExistingFile() {
    if (this.data.existingDocument) {
      await this.inquiryDocumentService.download(this.data.existingDocument.uuid, this.data.existingDocument.fileName);
    }
  }

  private async loadDocumentTypes() {
    const docTypes = await this.inquiryDocumentService.fetchTypes();
    docTypes.sort((a, b) => (a.label > b.label ? 1 : -1));
    this.documentTypes = docTypes.filter((type) => type.code !== DOCUMENT_TYPE.ORIGINAL_APPLICATION);
  }
}

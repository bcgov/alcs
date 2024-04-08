import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import {
  PlanningReviewDocumentDto,
  UpdateDocumentDto,
} from '../../../../services/planning-review/planning-review-document/planning-review-document.dto';
import { PlanningReviewDocumentService } from '../../../../services/planning-review/planning-review-document/planning-review-document.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../../../../shared/document/document.dto';
import { FileHandle } from '../../../../shared/drag-drop-file/drag-drop-file.directive';
import { splitExtension } from '../../../../shared/utils/file';

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss'],
})
export class DocumentUploadDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  DOCUMENT_TYPE = DOCUMENT_TYPE;

  @Output() uploadFiles: EventEmitter<FileHandle> = new EventEmitter();

  title = 'Create';
  isDirty = false;
  isSaving = false;
  documentTypeAhead: string | undefined = undefined;

  name = new FormControl<string>('', [Validators.required]);
  type = new FormControl<string | undefined>(undefined, [Validators.required]);
  source = new FormControl<string>('', [Validators.required]);
  visibleToCommissioner = new FormControl<boolean>(false, [Validators.required]);

  documentTypes: DocumentTypeDto[] = [];
  documentSources = Object.values(DOCUMENT_SOURCE);

  form = new FormGroup({
    name: this.name,
    type: this.type,
    source: this.source,
    visibleToCommissioner: this.visibleToCommissioner,
  });

  pendingFile: File | undefined;
  existingFile: { name: string; size: number } | undefined;
  showVirusError = false;
  extension = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { fileId: string; existingDocument?: PlanningReviewDocumentDto },
    protected dialog: MatDialogRef<any>,
    private planningReviewDocumentService: PlanningReviewDocumentService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();

    if (this.data.existingDocument) {
      const document = this.data.existingDocument;
      this.title = 'Edit';
      const { fileName, extension } = splitExtension(document.fileName);
      this.extension = extension;

      this.form.patchValue({
        name: fileName,
        type: document.type?.code,
        source: document.source,
        visibleToCommissioner: document.visibilityFlags.includes('C'),
      });
      this.documentTypeAhead = document.type!.code;
      this.existingFile = {
        name: document.fileName,
        size: 0,
      };
    }
  }

  async onSubmit() {
    const visibilityFlags: 'C'[] = [];

    if (this.visibleToCommissioner.getRawValue()) {
      visibilityFlags.push('C');
    }

    const file = this.pendingFile;
    const dto: UpdateDocumentDto = {
      fileName: this.name.value! + this.extension,
      source: this.source.value as DOCUMENT_SOURCE,
      typeCode: this.type.value as DOCUMENT_TYPE,
      visibilityFlags,
      file,
    };

    this.isSaving = true;
    if (this.data.existingDocument) {
      await this.planningReviewDocumentService.update(this.data.existingDocument.uuid, dto);
    } else if (file !== undefined) {
      try {
        await this.planningReviewDocumentService.upload(this.data.fileId, {
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
      const { fileName, extension } = splitExtension(this.pendingFile.name);
      this.extension = extension;
      this.name.setValue(fileName);
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
      await this.planningReviewDocumentService.download(
        this.data.existingDocument.uuid,
        this.data.existingDocument.fileName,
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

  private async loadDocumentTypes() {
    const docTypes = await this.planningReviewDocumentService.fetchTypes();
    docTypes.sort((a, b) => (a.label > b.label ? 1 : -1));
    this.documentTypes = docTypes.filter((type) => type.code !== DOCUMENT_TYPE.ORIGINAL_APPLICATION);
  }
}

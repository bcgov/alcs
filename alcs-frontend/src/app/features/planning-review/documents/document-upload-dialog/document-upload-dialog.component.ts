import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import {
  PlanningReviewDocumentDto,
  UpdateDocumentDto,
} from '../../../../services/planning-review/planning-review-document/planning-review-document.dto';
import { PlanningReviewDocumentService } from '../../../../services/planning-review/planning-review-document/planning-review-document.service';
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

  parcelId = new FormControl<string | null>(null);
  ownerId = new FormControl<string | null>(null);

  visibleToCommissioner = new FormControl<boolean>(false, [Validators.required]);

  documentTypes: DocumentTypeDto[] = [];
  documentSources = Object.values(DOCUMENT_SOURCE);
  selectableParcels: { uuid: string; index: number; pid?: string }[] = [];
  selectableOwners: { uuid: string; label: string }[] = [];

  form = new FormGroup({
    name: this.name,
    type: this.type,
    source: this.source,
    visibleToCommissioner: this.visibleToCommissioner,
    parcelId: this.parcelId,
    ownerId: this.ownerId,
  });

  pendingFile: File | undefined;
  existingFile: { name: string; size: number } | undefined;
  showSupersededWarning = false;
  showVirusError = false;

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
      this.allowsFileEdit = document.system === DOCUMENT_SYSTEM.ALCS;
      this.form.patchValue({
        name: document.fileName,
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
      fileName: this.name.value!,
      source: this.source.value as DOCUMENT_SOURCE,
      typeCode: this.type.value as DOCUMENT_TYPE,
      visibilityFlags,
      parcelUuid: this.parcelId.value ?? undefined,
      ownerUuid: this.ownerId.value ?? undefined,
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
      await this.planningReviewDocumentService.download(
        this.data.existingDocument.uuid,
        this.data.existingDocument.fileName,
      );
    }
  }

  private async loadDocumentTypes() {
    const docTypes = await this.planningReviewDocumentService.fetchTypes();
    docTypes.sort((a, b) => (a.label > b.label ? 1 : -1));
    this.documentTypes = docTypes.filter((type) => type.code !== DOCUMENT_TYPE.ORIGINAL_APPLICATION);
  }
}

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import {
  ApplicationDocumentDto,
  ApplicationDocumentTypeDto,
} from '../../../../services/application/application-document/application-document.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
  DOCUMENT_TYPE,
} from '../../../../services/application/application-document/application-document.service';

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss'],
})
export class DocumentUploadDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  title = 'Create';
  isDirty = false;
  isSaving = false;
  allowsFileEdit = true;
  sources = DOCUMENT_TYPE;
  documentTypeAhead: string | undefined = undefined;

  name = new FormControl<string>('', [Validators.required]);
  type = new FormControl<string | undefined>(undefined, [Validators.required]);
  source = new FormControl<string>('', [Validators.required]);

  visibleToInternal = new FormControl<boolean>(false, [Validators.required]);
  visibleToPublic = new FormControl<boolean>(false, [Validators.required]);

  documentTypes: ApplicationDocumentTypeDto[] = [];
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { fileId: string; existingDocument?: ApplicationDocumentDto },
    protected dialog: MatDialogRef<any>,
    private applicationDocumentService: ApplicationDocumentService
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
        visibleToInternal: document.visibilityFlags.includes('C') || document.visibilityFlags.includes('A'),
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
    const visibilityFlags: ('A' | 'C' | 'G' | 'P')[] = [];

    if (this.visibleToInternal.getRawValue()) {
      visibilityFlags.push('A');
      visibilityFlags.push('G');
      visibilityFlags.push('C');
    }

    if (this.visibleToPublic.getRawValue()) {
      visibilityFlags.push('P');
    }

    const dto = {
      file: this.pendingFile,
      fileName: this.name.getRawValue()!,
      source: this.source.getRawValue() as DOCUMENT_SOURCE,
      typeCode: this.type.getRawValue() as DOCUMENT_TYPE,
      visibilityFlags,
    };
    this.isSaving = true;
    if (this.data.existingDocument) {
      await this.applicationDocumentService.update(this.data.existingDocument.uuid, dto);
    } else if (dto.file !== undefined) {
      // @ts-ignore File is checked above to not be undefined, typescript still thinks it might be undefined
      await this.applicationDocumentService.upload(this.data.fileId, dto);
    }
    this.dialog.close(true);
    this.isSaving = false;
  }

  private async loadDocumentTypes() {
    const docTypes = await this.applicationDocumentService.fetchTypes();
    docTypes.sort((a, b) => (a.label > b.label ? 1 : -1));
    this.documentTypes = docTypes.filter((type) => type.code !== DOCUMENT_TYPE.ORIGINAL_APPLICATION);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  filterDocumentTypes(term: string, item: ApplicationDocumentTypeDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.label.toLocaleLowerCase().indexOf(termLower) > -1 ||
      item.oatsCode.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  onDocTypeSelected($event?: ApplicationDocumentTypeDto) {
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
      await this.applicationDocumentService.download(
        this.data.existingDocument.uuid,
        this.data.existingDocument.fileName
      );
    }
  }
}

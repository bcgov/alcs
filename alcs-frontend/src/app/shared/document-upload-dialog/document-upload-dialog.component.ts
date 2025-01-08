import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../services/toast/toast.service';
import { DOCUMENT_SOURCE, DOCUMENT_SYSTEM, DOCUMENT_TYPE, DocumentTypeDto } from '../document/document.dto';
import { FileHandle } from '../drag-drop-file/drag-drop-file.directive';
import { splitExtension } from '../utils/file';
import { DecisionService, DocumentService } from './document-upload-dialog.interface';
import {
  CreateDocumentDto,
  DocumentDto,
  SelectableOwnerDto,
  SelectableParcelDto,
  UpdateDocumentDto,
} from './document-upload-dialog.dto';
import { Subject } from 'rxjs';

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

  @Output() uploadFiles: EventEmitter<FileHandle> = new EventEmitter();

  name = new FormControl<string>('', [Validators.required]);
  type = new FormControl<string | undefined>(undefined, [Validators.required]);
  source = new FormControl<string>('', [Validators.required]);

  parcelId = new FormControl<string | null>(null);
  ownerId = new FormControl<string | null>(null);

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
    parcelId: this.parcelId,
    ownerId: this.ownerId,
  });

  pendingFile: File | undefined;
  existingFile: { name: string; size: number } | undefined;
  showSupersededWarning = false;
  showHasVirusError = false;
  showVirusScanFailedError = false;
  extension = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      fileId: string;
      decisionUuid?: string;
      existingDocument?: DocumentDto;
      decisionService?: DecisionService;
      documentService?: DocumentService;
      selectableParcels?: SelectableParcelDto[];
      selectableOwners?: SelectableOwnerDto[];
    },
    protected dialog: MatDialogRef<any>,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();

    if (this.data.existingDocument) {
      const document = this.data.existingDocument;
      this.title = 'Edit';
      this.allowsFileEdit = !!(this.data.decisionService || document.system === DOCUMENT_SYSTEM.ALCS);

      if (document.type?.code === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
        this.prepareCertificateOfTitleUpload(document.uuid);
        this.allowsFileEdit = false;
      }
      if (document.type?.code === DOCUMENT_TYPE.CORPORATE_SUMMARY) {
        this.prepareCorporateSummaryUpload(document.uuid);
        this.allowsFileEdit = false;
      }

      const { fileName, extension } = splitExtension(document.fileName);
      this.extension = extension;

      this.form.patchValue({
        name: fileName,
        source: document.source,
        visibleToInternal: document.visibilityFlags?.includes('C') || document.visibilityFlags?.includes('A'),
        visibleToPublic: document.visibilityFlags?.includes('P'),
      });

      this.existingFile = { name: document.fileName, size: 0 };

      if (this.data.documentService) {
        this.type.setValue(document.type!.code);
      }
    }

    if (this.data.decisionService) {
      this.type.disable();
      this.source.disable();
      this.visibleToInternal.disable();
      this.visibleToPublic.disable();

      this.type.setValue(DOCUMENT_TYPE.DECISION_DOCUMENT);
      this.source.setValue(DOCUMENT_SOURCE.ALC);
      this.visibleToInternal.setValue(true);
      this.visibleToPublic.setValue(true);
    }
  }

  async onSubmit() {
    const file = this.pendingFile;
    const visibilityFlags: ('A' | 'C' | 'G' | 'P')[] = [];

    if (this.visibleToInternal.getRawValue()) {
      visibilityFlags.push('A');
      visibilityFlags.push('G');
      visibilityFlags.push('C');
    }

    if (this.visibleToPublic.getRawValue()) {
      visibilityFlags.push('P');
    }

    const dto: UpdateDocumentDto = {
      fileName: this.name.value! + this.extension,
      source: this.source.value as DOCUMENT_SOURCE,
      typeCode: this.type.value as DOCUMENT_TYPE,
      visibilityFlags,
      parcelUuid: this.parcelId.value ?? undefined,
      ownerUuid: this.ownerId.value ?? undefined,
    };

    if (file) {
      const renamedFile = new File([file], this.name.value! + this.extension, { type: file.type });
      this.isSaving = true;
      if (this.data.existingDocument) {
        if (this.data.decisionService && this.data.decisionUuid) {
          this.data.decisionService.deleteFile(this.data.decisionUuid, this.data.existingDocument.uuid);
        }
      }

      try {
        if (this.data.decisionService && this.data.decisionUuid) {
          await this.data.decisionService.uploadFile(this.data.decisionUuid, renamedFile);
        } else if (this.data.documentService) {
          await this.data.documentService.upload(this.data.fileId, { ...dto, file } as CreateDocumentDto);
        }
      } catch (err) {
        this.toastService.showErrorToast('Document upload failed');
        if (err instanceof HttpErrorResponse) {
          if (err.status === 400) {
            this.showHasVirusError = true;
          } else if (err.status === 500) {
            this.showVirusScanFailedError = true;
          }
          this.isSaving = false;
          this.pendingFile = undefined;
          return;
        }
      }

      this.dialog.close(true);
      this.isSaving = false;
    } else if (this.data.existingDocument) {
      this.isSaving = true;
      if (this.data.decisionService && this.data.decisionUuid) {
        await this.data.decisionService.updateFile(
          this.data.decisionUuid,
          this.data.existingDocument.uuid,
          this.name.value! + this.extension,
        );
      } else if (this.data.documentService) {
        this.data.documentService.update(this.data.existingDocument.uuid, dto);
      }

      this.dialog.close(true);
      this.isSaving = false;
    }
  }

  async prepareCertificateOfTitleUpload(uuid?: string) {
    if (this.data.selectableParcels && this.data.selectableParcels.length > 0) {
      this.parcelId.setValidators([Validators.required]);
      this.parcelId.updateValueAndValidity();
      this.source.setValue(DOCUMENT_SOURCE.APPLICANT);

      const selectedParcel = this.data.selectableParcels.find((parcel) => parcel.certificateOfTitleUuid === uuid);
      if (selectedParcel) {
        this.parcelId.setValue(selectedParcel.uuid);
      } else if (uuid) {
        this.showSupersededWarning = true;
      }
    }
  }

  async prepareCorporateSummaryUpload(uuid?: string) {
    if (this.data.selectableOwners && this.data.selectableOwners.length > 0) {
      this.ownerId.setValidators([Validators.required]);
      this.ownerId.updateValueAndValidity();
      this.source.setValue(DOCUMENT_SOURCE.APPLICANT);

      const selectedOwner = this.data.selectableOwners.find((owner) => owner.corporateSummaryUuid === uuid);
      if (selectedOwner) {
        this.ownerId.setValue(selectedOwner.uuid);
      } else if (uuid) {
        this.showSupersededWarning = true;
      }
    }
  }

  async onDocTypeSelected($event?: DocumentTypeDto) {
    if (this.type.value === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
      await this.prepareCertificateOfTitleUpload();
      this.visibleToInternal.setValue(true);
    } else {
      this.parcelId.setValue(null);
      this.parcelId.setValidators([]);
      this.parcelId.updateValueAndValidity();
    }

    if (this.type.value === DOCUMENT_TYPE.CORPORATE_SUMMARY) {
      await this.prepareCorporateSummaryUpload();
      this.visibleToInternal.setValue(true);
    } else {
      this.ownerId.setValue(null);
      this.ownerId.setValidators([]);
      this.ownerId.updateValueAndValidity();
    }
  }

  filterDocumentTypes(term: string, item: DocumentTypeDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.label.toLocaleLowerCase().indexOf(termLower) > -1 ||
      item.oatsCode.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  uploadFile(event: Event) {
    const element = event.target as HTMLInputElement;
    const selectedFiles = element.files;
    if (selectedFiles && selectedFiles[0]) {
      this.pendingFile = selectedFiles[0];
      const { fileName, extension } = splitExtension(selectedFiles[0].name);
      this.name.setValue(fileName);
      this.extension = extension;
      this.showHasVirusError = false;
      this.showVirusScanFailedError = false;
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
      if (this.data.decisionService && this.data.decisionUuid) {
        await this.data.decisionService.downloadFile(
          this.data.decisionUuid,
          this.data.existingDocument.uuid,
          this.data.existingDocument.fileName,
          true,
        );
      } else if (this.data.documentService) {
        await this.data.documentService.download(
          this.data.existingDocument.uuid,
          this.data.existingDocument.fileName,
          true,
        );
      }
    }
  }

  filesDropped($event: FileHandle) {
    this.pendingFile = $event.file;
    const { fileName, extension } = splitExtension(this.pendingFile.name);
    this.extension = extension;
    this.name.setValue(fileName);
    this.showHasVirusError = false;
    this.showVirusScanFailedError = false;
    this.uploadFiles.emit($event);
  }

  private async loadDocumentTypes() {
    if (this.data.documentService) {
      const docTypes = await this.data.documentService.fetchTypes();
      docTypes.sort((a, b) => (a.label > b.label ? 1 : -1));
      this.documentTypes = docTypes.filter((type) => type.code !== DOCUMENT_TYPE.ORIGINAL_APPLICATION);
    } else if (this.data.decisionService) {
      this.documentTypes = [
        {
          code: DOCUMENT_TYPE.DECISION_DOCUMENT,
          label: 'Decision Package',
          description: '',
          oatsCode: '',
        },
      ];
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}

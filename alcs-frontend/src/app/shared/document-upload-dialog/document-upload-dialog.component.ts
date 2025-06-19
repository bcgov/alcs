import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../services/toast/toast.service';
import { DEFAULT_DOCUMENT_SOURCES, DOCUMENT_SOURCE, DOCUMENT_TYPE, DocumentTypeDto } from '../document/document.dto';
import { FileHandle } from '../drag-drop-file/drag-drop-file.directive';
import { splitExtension } from '../utils/file';
import {
  CreateDocumentDto,
  SelectableOwnerDto,
  SelectableParcelDto,
  UpdateDocumentDto,
} from './document-upload-dialog.dto';
import { Subject } from 'rxjs';
import { DocumentUploadDialogData } from './document-upload-dialog.interface';

export enum VisibilityGroup {
  INTERNAL = 'Internal',
  PUBLIC = 'Public',
}

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
  documentSources: DOCUMENT_SOURCE[] = [];

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

  internalVisibilityLabel = '';

  selectableParcels: SelectableParcelDto[] = [];
  selectableOwners: SelectableOwnerDto[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: DocumentUploadDialogData,
    protected dialog: MatDialogRef<any>,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();

    this.internalVisibilityLabel = this.buildInternalVisibilityLabel();

    this.documentSources = this.data.allowedDocumentSources ?? DEFAULT_DOCUMENT_SOURCES;

    if (this.data.existingDocument) {
      const document = this.data.existingDocument;
      this.title = 'Edit';

      this.allowsFileEdit = this.data.allowsFileEdit ?? this.allowsFileEdit;

      if (document.type && this.data.documentTypeOverrides && this.data.documentTypeOverrides[document.type.code]) {
        this.allowsFileEdit = !!this.data.documentTypeOverrides[document.type.code]?.allowsFileEdit;
      }

      if (document.type?.code === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
        this.prepareCertificateOfTitleUpload(document.uuid);
      }
      if (document.type?.code === DOCUMENT_TYPE.CORPORATE_SUMMARY) {
        this.prepareCorporateSummaryUpload(document.uuid);
      }

      const { fileName, extension } = splitExtension(document.fileName);
      this.extension = extension;

      this.form.patchValue({
        name: fileName,
        source: document.source,
        visibleToInternal: !!(
          document.visibilityFlags?.includes('A') ||
          document.visibilityFlags?.includes('C') ||
          document.visibilityFlags?.includes('G')
        ),
        visibleToPublic: !!document.visibilityFlags?.includes('P'),
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

  buildInternalVisibilityLabel(): string {
    const ordinalsByWord = {
      Applicant: 0,
      'L/FNG': 1,
      Commissioner: 2,
    };

    type Word = keyof typeof ordinalsByWord;

    const wordsByFlag: {
      A: Word;
      G: Word;
      C: Word;
    } = {
      A: 'Applicant',
      G: 'L/FNG',
      C: 'Commissioner',
    };

    const words = (
      this.data.allowedVisibilityFlags?.reduce((words, flag) => {
        if (flag !== 'P') {
          words.push(wordsByFlag[flag]);
        }
        return words;
      }, [] as Word[]) ?? []
    ).sort((word1, word2) => ordinalsByWord[word1] - ordinalsByWord[word2]);

    if (words.length === 0) {
      return '';
    }

    if (words.length === 1) {
      return words[0];
    }

    if (words.length === 2) {
      return `${words[0]} and ${words[1]}`;
    }

    return `${words.slice(0, -1).join(', ')}, and ${words[words.length - 1]}`;
  }

  async onSubmit() {
    const file = this.pendingFile;
    const visibilityFlags: ('A' | 'C' | 'G' | 'P')[] = [];

    if (this.visibleToInternal.getRawValue()) {
      for (const flag of this.data.allowedVisibilityFlags ?? []) {
        if (flag !== 'P') {
          visibilityFlags.push(flag);
        }
      }
    }

    if (this.visibleToPublic.getRawValue() && this.data.allowedVisibilityFlags?.includes('P')) {
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
          await this.data.decisionService.deleteFile(this.data.decisionUuid, this.data.existingDocument.uuid);
        } else if (this.data.documentService) {
          await this.data.documentService.delete(this.data.existingDocument.uuid);
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
        await this.data.documentService.update(this.data.existingDocument.uuid, dto);
      }

      this.dialog.close(true);
      this.isSaving = false;
    }
  }

  async prepareCertificateOfTitleUpload(uuid?: string) {
    this.source.setValue(DOCUMENT_SOURCE.APPLICANT);
    this.parcelId.setValidators([Validators.required]);
    this.parcelId.updateValueAndValidity();

    if (!this.data.parcelService) {
      return;
    }

    this.selectableParcels = await this.data.parcelService.fetchParcels(this.data.fileId);

    if (this.selectableParcels.length < 1) {
      return;
    }

    const selectedParcel = this.selectableParcels.find((parcel) => parcel.certificateOfTitleUuid === uuid);
    if (selectedParcel) {
      this.parcelId.setValue(selectedParcel.uuid);
    } else if (uuid) {
      this.showSupersededWarning = true;
    }
  }

  async prepareCorporateSummaryUpload(uuid?: string) {
    this.source.setValue(DOCUMENT_SOURCE.APPLICANT);
    this.ownerId.setValidators([Validators.required]);
    this.ownerId.updateValueAndValidity();

    if (!this.data.submissionService) {
      return;
    }

    const submission = await this.data.submissionService.fetchSubmission(this.data.fileId);
    this.selectableOwners = submission.owners
      .filter((owner) => owner.type.code === 'ORGZ')
      .map((owner) => ({
        ...owner,
        label: owner.organizationName ?? owner.displayName,
      }));

    if (this.selectableOwners.length < 1) {
      return;
    }

    const selectedOwner = this.selectableOwners.find((owner) => owner.corporateSummaryUuid === uuid);
    if (selectedOwner) {
      this.ownerId.setValue(selectedOwner.uuid);
    } else if (uuid) {
      this.showSupersededWarning = true;
    }
  }

  async onDocTypeSelected($event?: DocumentTypeDto) {
    if (!$event) {
      return;
    }

    if (this.data.documentTypeOverrides && this.data.documentTypeOverrides[$event.code]) {
      for (const visibilityGroup of this.data.documentTypeOverrides[$event.code]?.visibilityGroups ?? []) {
        if (visibilityGroup === VisibilityGroup.INTERNAL) {
          this.visibleToInternal.setValue(true);
        }

        if (visibilityGroup === VisibilityGroup.PUBLIC) {
          this.visibleToPublic.setValue(true);
        }
      }
    }

    if ($event.code === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
      await this.prepareCertificateOfTitleUpload();
    } else {
      this.parcelId.setValue(null);
      this.parcelId.setValidators([]);
      this.parcelId.updateValueAndValidity();
    }

    if ($event.code === DOCUMENT_TYPE.CORPORATE_SUMMARY) {
      await this.prepareCorporateSummaryUpload();
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

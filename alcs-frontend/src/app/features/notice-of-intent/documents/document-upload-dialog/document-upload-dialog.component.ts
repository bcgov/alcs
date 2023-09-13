import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';
import {
  DOCUMENT_SOURCE,
  DOCUMENT_SYSTEM,
  DOCUMENT_TYPE,
  DocumentTypeDto,
} from '../../../../shared/document/document.dto';
import {
  NoticeOfIntentDocumentDto,
  UpdateNoticeOfIntentDocumentDto,
} from '../../../../services/notice-of-intent/noi-document/noi-document.dto';
import { NoiDocumentService } from '../../../../services/notice-of-intent/noi-document/noi-document.service';

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

  visibleToInternal = new FormControl<boolean>(false, [Validators.required]);
  visibleToPublic = new FormControl<boolean>(false, [Validators.required]);

  documentTypes: DocumentTypeDto[] = [];
  documentSources = Object.values(DOCUMENT_SOURCE);
  selectableParcels: { uuid: string; index: number; pid?: string }[] = [];
  selectableOwners: { uuid: string; label: string }[] = [];

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
  showVirusError = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { fileId: string; existingDocument?: NoticeOfIntentDocumentDto },
    protected dialog: MatDialogRef<any>,
    private noiDocumentService: NoiDocumentService,
    private noiSubmissionService: NoticeOfIntentSubmissionService,
    private noiParcelService: NoticeOfIntentParcelService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();

    if (this.data.existingDocument) {
      const document = this.data.existingDocument;
      this.title = 'Edit';
      this.allowsFileEdit = document.system === DOCUMENT_SYSTEM.ALCS;

      if (document.type?.code === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
        this.prepareCertificateOfTitleUpload(document.uuid);
        this.allowsFileEdit = false;
      }
      if (document.type?.code === DOCUMENT_TYPE.CORPORATE_SUMMARY) {
        this.allowsFileEdit = false;
        this.prepareCorporateSummaryUpload(document.uuid);
      }

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
      parcelUuid: this.parcelId.value ?? undefined,
      ownerUuid: this.ownerId.value ?? undefined,
    };

    const file = this.pendingFile;
    this.isSaving = true;
    if (this.data.existingDocument) {
      await this.noiDocumentService.update(this.data.existingDocument.uuid, dto);
    } else if (file !== undefined) {
      try {
        await this.noiDocumentService.upload(this.data.fileId, {
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
      await this.noiDocumentService.download(this.data.existingDocument.uuid, this.data.existingDocument.fileName);
    }
  }

  private async prepareCertificateOfTitleUpload(uuid?: string) {
    const parcels = await this.noiParcelService.fetchParcels(this.data.fileId);
    if (parcels.length > 0) {
      this.parcelId.setValidators([Validators.required]);
      this.parcelId.updateValueAndValidity();
      this.source.setValue(DOCUMENT_SOURCE.APPLICANT);

      const selectedParcel = parcels.find((parcel) => parcel.certificateOfTitleUuid === uuid);
      if (selectedParcel) {
        this.parcelId.setValue(selectedParcel.uuid);
      } else if (uuid) {
        this.showSupersededWarning = true;
      }

      this.selectableParcels = parcels.map((parcel, index) => ({
        uuid: parcel.uuid,
        pid: parcel.pid,
        index: index,
      }));
    }
  }

  private async prepareCorporateSummaryUpload(uuid?: string) {
    const submission = await this.noiSubmissionService.fetchSubmission(this.data.fileId);
    if (submission.owners.length > 0) {
      const owners = submission.owners;
      this.ownerId.setValidators([Validators.required]);
      this.ownerId.updateValueAndValidity();
      this.source.setValue(DOCUMENT_SOURCE.APPLICANT);

      const selectedOwner = owners.find((owner) => owner.corporateSummaryUuid === uuid);
      if (selectedOwner) {
        this.ownerId.setValue(selectedOwner.uuid);
      } else if (uuid) {
        this.showSupersededWarning = true;
      }

      this.selectableOwners = owners
        .filter((owner) => owner.type.code === 'ORGZ')
        .map((owner, index) => ({
          label: owner.organizationName ?? owner.displayName,
          uuid: owner.uuid,
        }));
    }
  }

  private async loadDocumentTypes() {
    const docTypes = await this.noiDocumentService.fetchTypes();
    docTypes.sort((a, b) => (a.label > b.label ? 1 : -1));
    this.documentTypes = docTypes.filter((type) => type.code !== DOCUMENT_TYPE.ORIGINAL_APPLICATION);
  }
}

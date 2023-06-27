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
import { ApplicationParcelService } from '../../../../services/application/application-parcel/application-parcel.service';

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

  visibleToInternal = new FormControl<boolean>(false, [Validators.required]);
  visibleToPublic = new FormControl<boolean>(false, [Validators.required]);

  documentTypes: ApplicationDocumentTypeDto[] = [];
  documentSources = Object.values(DOCUMENT_SOURCE);
  selectableParcels: { uuid: string; index: number; pid?: string }[] = [];

  form = new FormGroup({
    name: this.name,
    type: this.type,
    source: this.source,
    visibleToInternal: this.visibleToInternal,
    visibleToPublic: this.visibleToPublic,
    parcelId: this.parcelId,
  });

  pendingFile: File | undefined;
  existingFile: { name: string; size: number } | undefined;
  showCertificateOfTitleWarning = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { fileId: string; existingDocument?: ApplicationDocumentDto },
    protected dialog: MatDialogRef<any>,
    private applicationDocumentService: ApplicationDocumentService,
    private parcelService: ApplicationParcelService
  ) {}

  ngOnInit(): void {
    this.loadDocumentTypes();

    if (this.data.existingDocument) {
      const document = this.data.existingDocument;
      this.title = 'Edit';
      this.allowsFileEdit = document.system === DOCUMENT_SYSTEM.ALCS;
      if (document.type?.code === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
        this.prepareCertificateOfTitleUpload(document.uuid);
      }
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

    const parcelId = await this.parcelId.value;

    const dto = {
      file: this.pendingFile,
      fileName: this.name.getRawValue()!,
      source: this.source.getRawValue() as DOCUMENT_SOURCE,
      typeCode: this.type.getRawValue() as DOCUMENT_TYPE,
      visibilityFlags,
    };
    this.isSaving = true;
    if (parcelId && dto.file && this.type.value === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
      // @ts-ignore File is checked above to not be undefined, typescript still thinks it might be undefined
      await this.applicationDocumentService.attachCertificateOfTitle(this.data.fileId, parcelId, dto);
    } else if (this.data.existingDocument) {
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

  async prepareCertificateOfTitleUpload(uuid?: string) {
    const parcels = await this.parcelService.fetchParcels(this.data.fileId);
    debugger;
    if (parcels.length > 0) {
      this.parcelId.setValidators([Validators.required]);
      this.parcelId.updateValueAndValidity();

      this.visibleToInternal.setValue(true);
      this.visibleToPublic.setValue(true);
      this.source.setValue(DOCUMENT_SOURCE.APPLICANT);

      const selectedParcel = parcels.find((parcel) => parcel.certificateOfTitleUuid === uuid);
      if (selectedParcel) {
        this.parcelId.setValue(selectedParcel.uuid);
      } else if (uuid) {
        this.showCertificateOfTitleWarning = true;
      }

      this.selectableParcels = parcels
        .filter((parcel) => parcel.parcelType === 'application')
        .map((parcel, index) => ({
          uuid: parcel.uuid,
          pid: parcel.pid,
          index: index,
        }));
    }
  }

  async onDocTypeSelected($event?: ApplicationDocumentTypeDto) {
    if ($event) {
      this.type.setValue($event.code);
    } else {
      this.type.setValue(undefined);
    }

    if (this.type.value === DOCUMENT_TYPE.CERTIFICATE_OF_TITLE) {
      await this.prepareCertificateOfTitleUpload();
    } else {
      this.parcelId.setValue(null);
      this.parcelId.setValidators([]);
      this.parcelId.updateValueAndValidity();
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

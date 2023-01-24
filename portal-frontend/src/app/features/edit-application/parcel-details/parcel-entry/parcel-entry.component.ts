import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

import {
  APPLICATION_PARCEL_DOCUMENT,
  ApplicationParcelDto,
} from '../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ApplicationDocumentDto } from '../../../../services/application/application.dto';
import { ParcelService } from '../../../../services/parcel/parcel.service';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../shared/utils/boolean-helper';

export interface ParcelEntryFormData {
  uuid: string;
  pidPin: string | undefined | null;
  legalDescription: string | undefined | null;
  mapArea: string | undefined | null;
  pin: string | undefined | null;
  pid: string | undefined | null;
  parcelType: string | undefined | null;
  isFarm: string | undefined | null;
  purchaseDate?: Date | null;
  isConfirmedByApplicant: boolean;
}

@Component({
  selector: 'app-parcel-entry',
  templateUrl: './parcel-entry.component.html',
  styleUrls: ['./parcel-entry.component.scss'],
})
export class ParcelEntryComponent implements OnInit {
  @Output() private onFormGroupChange = new EventEmitter<Partial<ParcelEntryFormData>>();
  @Output() private onFilesUpdated = new EventEmitter<void>();
  @Output() private onSaveProgress = new EventEmitter<void>();

  @Input()
  parcel!: ApplicationParcelDto;

  pidPin = new FormControl<string>('');
  legalDescription = new FormControl<string | null>(null);
  mapArea = new FormControl<string | null>(null);
  pin = new FormControl<string | null>(null);
  pid = new FormControl<string | null>(null);
  parcelType = new FormControl<string | null>(null);
  isFarm = new FormControl<string | null>(null);
  purchaseDate = new FormControl<any | null>(null);
  isConfirmedByApplicant = new FormControl<boolean>(false);
  parcelForm = new FormGroup({
    pidPin: this.pidPin,
    legalDescription: this.legalDescription,
    mapArea: this.mapArea,
    pin: this.pin,
    pid: this.pid,
    parcelType: this.parcelType,
    isFarm: this.isFarm,
    purchaseDate: this.purchaseDate,
    isConfirmedByApplicant: this.isConfirmedByApplicant,
  });

  documentTypes = APPLICATION_PARCEL_DOCUMENT;

  constructor(private parcelService: ParcelService, private applicationParcelService: ApplicationParcelService) {}

  ngOnInit(): void {
    this.parcelForm.valueChanges.subscribe((formData) => {
      if (this.parcelForm.dirty && formData.isConfirmedByApplicant === this.parcel.isConfirmedByApplicant) {
        this.parcel.isConfirmedByApplicant = false;
        formData.isConfirmedByApplicant = false;

        this.parcelForm.patchValue(
          {
            isConfirmedByApplicant: false,
          },
          { emitEvent: false }
        );
      }

      return this.onFormGroupChange.emit({
        ...formData,
        uuid: this.parcel.uuid,
        isConfirmedByApplicant: formData.isConfirmedByApplicant!,
        purchaseDate: new Date(formData.purchaseDate?.valueOf()),
      });
    });

    this.parcelForm.patchValue({
      legalDescription: this.parcel.legalDescription,
      mapArea: this.parcel.mapAreaHectares,
      pid: this.parcel.pid,
      pin: this.parcel.pin,
      parcelType: this.parcel.ownershipTypeCode,
      isFarm: formatBooleanToString(this.parcel.isFarm),
      purchaseDate: this.parcel.purchasedDate ? new Date(this.parcel.purchasedDate) : null,
      isConfirmedByApplicant: this.parcel.isConfirmedByApplicant,
    });
  }

  async onSearch() {
    const result = await this.parcelService.getByPidPin(this.pidPin.getRawValue()!);
    if (result) {
      this.legalDescription.setValue(result.legalDescription);
      this.mapArea.setValue(result.mapArea);
      if (result.pin) {
        this.pin.setValue(result.pin);
      }
    }
  }

  onReset() {
    this.parcelForm.reset();
  }

  onChangeParcelType($event: MatButtonToggleChange) {
    const val = $event.value === 'CRWN';
    if ($event.value === 'CRWN') {
      this.purchaseDate.reset();
      this.purchaseDate.disable();
    } else {
      this.purchaseDate.enable();
    }
  }

  async attachFile(files: FileHandle[], documentType: APPLICATION_PARCEL_DOCUMENT, parcelUuid: string) {
    if (parcelUuid) {
      const mappedFiles = files.map((file) => file.file);
      await this.applicationParcelService.attachExternalFile(parcelUuid, mappedFiles, documentType);
      this.onFilesUpdated.emit();
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    await this.applicationParcelService.deleteExternalFile($event.uuid);
    this.onFilesUpdated.emit();
  }

  async openFile(uuid: string) {
    const res = await this.applicationParcelService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  async beforeFileUploadOpened() {
    this.onSaveProgress.emit();
  }
}

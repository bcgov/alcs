import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

import { ApplicationParcelDto } from '../../../../services/application-parcel/application-parcel.dto';
import { ParcelService } from '../../../../services/parcel/parcel.service';

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
}

@Component({
  selector: 'app-parcel-entry',
  templateUrl: './parcel-entry.component.html',
  styleUrls: ['./parcel-entry.component.scss'],
})
export class ParcelEntryComponent implements OnInit {
  @Output() private onFormGroupChange = new EventEmitter<Partial<ParcelEntryFormData>>();

  @Input()
  parcel!: ApplicationParcelDto;

  pidPin = new FormControl<string>('');
  legalDescription = new FormControl<string | null>(null);
  mapArea = new FormControl<string | null>(null);
  pin = new FormControl<string | null>(null);
  pid = new FormControl<string | null>(null);
  parcelType = new FormControl<string | null>(null);
  isFarm = new FormControl<string | null>(null);
  purchaseDate = new FormControl<Date | null>(null);

  constructor(private parcelService: ParcelService) {}

  parcelForm = new FormGroup({
    pidPin: this.pidPin,
    legalDescription: this.legalDescription,
    mapArea: this.mapArea,
    pin: this.pin,
    pid: this.pid,
    parcelType: this.parcelType,
    isFarm: this.isFarm,
    purchaseDate: this.purchaseDate,
  });

  ngOnInit(): void {
    this.parcelForm.valueChanges.subscribe((formData) => {
      return this.onFormGroupChange.emit({ uuid: this.parcel.uuid || 'aa', ...formData });
    });

    console.log('parcel-entry', this.parcel);

    this.parcelForm.patchValue({
      legalDescription: this.parcel.legalDescription,
      mapArea: this.parcel.mapAreaHectares,
      pid: this.parcel.pid,
      pin: this.parcel.pin,
      parcelType: this.parcel.ownershipTypeCode,
      isFarm: this.formatBoolean(this.parcel.isFarm),
      purchaseDate: this.parcel.purchasedDate ? new Date(this.parcel.purchasedDate) : null,
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

  // TODO move to utils
  private formatBoolean(val?: boolean | null) {
    switch (val) {
      case true:
        return 'true';
      case false:
        return 'false';
      default:
        return undefined;
    }
  }
}
